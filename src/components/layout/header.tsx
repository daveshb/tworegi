import { ReactNode } from "react"

interface HeaderProps {
  children: ReactNode
  className?: string
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header className={`border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 ${className || ""}`}>
      <div className="container flex h-14 items-center">
        {children}
      </div>
    </header>
  )
}

interface FooterProps {
  children: ReactNode
  className?: string
}

export function Footer({ children, className }: FooterProps) {
  return (
    <footer className={`border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 ${className || ""}`}>
      <div className="container py-6">
        {children}
      </div>
    </footer>
  )
}