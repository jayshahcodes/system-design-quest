import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

interface FieldProps {
  id: string
  label: string
  children: ReactNode
}

function Field({ id, label, children }: FieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      {children}
    </>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label: string
}

export function SelectField({ id, label, children, ...props }: SelectFieldProps) {
  return (
    <Field id={id} label={label}>
      <select id={id} {...props}>
        {children}
      </select>
    </Field>
  )
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

export function InputField({ id, label, ...props }: InputFieldProps) {
  return (
    <Field id={id} label={label}>
      <input id={id} {...props} />
    </Field>
  )
}
