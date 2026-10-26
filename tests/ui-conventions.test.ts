import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import ts from 'typescript'

interface Violation {
  kind: 'text' | 'attribute' | 'callback'
  line: number
}

const textAttributes = new Set([
  'title', 'aria-label', 'aria-description', 'aria-placeholder', 'aria-roledescription',
  'aria-valuetext', 'placeholder', 'alt', 'label', 'children', 'intro', 'eyebrow', 'outline',
])

function containsCopy(expression: ts.Expression): boolean {
  if (ts.isStringLiteralLike(expression)) return expression.text.trim().length > 0
  if (ts.isTemplateExpression(expression)) {
    return expression.head.text.trim().length > 0
      || expression.templateSpans.some(function hasCopy(span) {
        return span.literal.text.trim().length > 0 || containsCopy(span.expression)
      })
  }
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)
    || ts.isSatisfiesExpression(expression) || ts.isNonNullExpression(expression)) {
    return containsCopy(expression.expression)
  }
  if (ts.isConditionalExpression(expression)) {
    return containsCopy(expression.whenTrue) || containsCopy(expression.whenFalse)
  }
  if (ts.isBinaryExpression(expression)) {
    if (expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      return containsCopy(expression.right)
    }
    if ([ts.SyntaxKind.PlusToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken]
      .includes(expression.operatorToken.kind)) {
      return containsCopy(expression.left) || containsCopy(expression.right)
    }
  }
  return false
}

function inspectTsx(source: string): Violation[] {
  const file = ts.createSourceFile('fixture.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const violations: Violation[] = []

  function report(kind: Violation['kind'], node: ts.Node) {
    violations.push({ kind, line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1 })
  }

  function visit(node: ts.Node, insideJsx = false) {
    const jsx = insideJsx || ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)
    if (ts.isJsxText(node) && node.text.trim()) report('text', node)
    if (jsx && (ts.isArrowFunction(node) || ts.isFunctionExpression(node))) report('callback', node)
    if (ts.isJsxAttribute(node) && textAttributes.has(node.name.getText(file)) && node.initializer) {
      const initializer = node.initializer
      if (ts.isStringLiteral(initializer) && initializer.text.trim()) report('attribute', initializer)
      if (ts.isJsxExpression(initializer) && initializer.expression && containsCopy(initializer.expression)) {
        report('attribute', initializer)
      }
    }
    if (ts.isJsxExpression(node) && !ts.isJsxAttribute(node.parent) && node.expression && containsCopy(node.expression)) {
      report('text', node)
    }
    ts.forEachChild(node, function visitChild(child) {
      visit(child, jsx)
    })
  }

  visit(file)
  return violations
}

function tsxFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(function visitEntry(entry) {
    const path = new URL(entry.name, directory)
    if (entry.isDirectory()) return tsxFiles(new URL(`${entry.name}/`, directory))
    return entry.name.endsWith('.tsx') ? [path] : []
  })
}

test('all React source keeps copy and callbacks outside JSX', () => {
  const files = tsxFiles(new URL('../src/', import.meta.url))
  assert.ok(files.length > 0)
  for (const file of files) {
    assert.deepEqual(inspectTsx(readFileSync(file, 'utf8')), [], fileURLToPath(file))
  }
})

test('guard rejects literal JSX copy, including symbols and expression strings', () => {
  for (const source of [
    '<p>Hello</p>', '<span>↗</span>', '<p>{"Hello"}</p>',
    '<p>{ready ? "Ready" : copy.wait}</p>', '<p>{`Question ${index}`}</p>',
    '<p>{ready && "Ready"}</p>', '<p>{copy.title + "!"}</p>',
  ]) {
    assert.ok(inspectTsx(source).some(function isText(item) { return item.kind === 'text' }), source)
  }
})

test('guard rejects inline accessible labels and copy-valued component props', () => {
  for (const source of [
    '<button aria-label="Edit" />', '<img alt={"Architecture"} />',
    '<input placeholder={`Name ${index}`} />', '<div title={ready ? "Ready" : copy.wait} />',
    '<SelectField label="Practice area" />', '<PageHeader intro="Introduction" />',
    '<div aria-description="Help" />', '<progress aria-valuetext="Halfway" />',
  ]) {
    assert.ok(inspectTsx(source).some(function isAttribute(item) { return item.kind === 'attribute' }), source)
  }
})

test('guard rejects event, map, nested and render-prop callbacks', () => {
  for (const source of [
    '<button onClick={() => choose()} />', '<button onClick={function choose() {}} />',
    '<ul>{items.map((item) => <li key={item.id}>{item.title}</li>)}</ul>',
    '<List render={function render(item) { return item.title }} />',
    '<div>{render(items.filter((item) => item.active))}</div>',
    '<List>{() => copy.title}</List>',
  ]) {
    assert.ok(inspectTsx(source).some(function isCallback(item) { return item.kind === 'callback' }), source)
  }
})

test('guard accepts named handlers, data copy, technical attributes and whitespace', () => {
  const source = `
    function renderItem(item) { return <option value={item.id}>{item.title}</option> }
    function handleChange(event) { choose(event.target.value) }
    const view = <section className="panel" role="status" aria-live="polite">
      <label htmlFor="topic">{copy.label}</label>
      <select id="topic" value="all" onChange={handleChange} aria-label={copy.area}>
        {items.map(renderItem)}
      </select>
      <span>{kind === 'scenario' ? copy.scenario : copy.quick}</span>
      <span>{formatCount(items.length)}</span>
    </section>
  `
  assert.deepEqual(inspectTsx(source), [])
})

test('guard does not confuse non-JSX callbacks or technical conditions with inline JSX callbacks', () => {
  assert.deepEqual(inspectTsx(`
    const matches = items.filter((item) => item.type === 'Client')
    const view = <div>{matches.length === 0 && <span>{copy.empty}</span>}</div>
  `), [])
})
