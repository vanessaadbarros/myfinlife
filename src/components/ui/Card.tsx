import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  variant = 'default'
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const variantClasses = {
    default: 'bg-myfinlife-white border border-myfinlife-blue-light shadow-myfinlife',
    elevated: 'bg-myfinlife-white border border-myfinlife-blue-light shadow-myfinlife-lg',
    outlined: 'bg-myfinlife-white border-2 border-myfinlife-blue shadow-myfinlife',
  }

  return (
    <div className={`
      rounded-hex transition-all duration-200
      ${variantClasses[variant]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Componente de cabeçalho do card
interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-myfinlife-blue-light pb-3 mb-4 ${className}`}>
      {children}
    </div>
  )
}

// Componente de título do card
interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-myfinlife-blue ${className}`}>
      {children}
    </h3>
  )
}

// Componente de conteúdo do card
interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`text-myfinlife-blue/80 ${className}`}>
      {children}
    </div>
  )
}

// Componente de rodapé do card
interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`border-t border-myfinlife-blue-light pt-3 mt-4 ${className}`}>
      {children}
    </div>
  )
}