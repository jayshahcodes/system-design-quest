import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: ReactNode
  title: ReactNode
  intro: ReactNode
  outline?: string
}

export function PageHeader({ eyebrow, title, intro, outline }: PageHeaderProps) {
  const heading = (
    <>
      <h1>{title}</h1>
      <p className="page-intro">{intro}</p>
    </>
  )

  return (
    <>
      <div className="eyebrow">{eyebrow}</div>
      {outline ? (
        <div className="page-heading">
          <div>{heading}</div>
          <span className="outline-label">{outline}</span>
        </div>
      ) : heading}
    </>
  )
}
