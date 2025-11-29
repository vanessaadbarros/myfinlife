import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-montserrat font-medium rounded-hex transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-myfinlife'
  
      const variants = {
        primary: 'bg-myfinlife-blue text-myfinlife-white hover:bg-myfinlife-blue/90 focus:ring-myfinlife-blue/50 shadow-myfinlife hover:shadow-myfinlife-lg',
        secondary: 'bg-myfinlife-white border border-myfinlife-blue text-myfinlife-blue hover:bg-myfinlife-blue-light focus:ring-myfinlife-blue/30',
        danger: 'bg-danger-500 text-myfinlife-white hover:bg-danger-600 focus:ring-danger-500',
        ghost: 'bg-transparent text-myfinlife-blue hover:bg-myfinlife-blue-light focus:ring-myfinlife-blue/30',
        outline: 'border border-myfinlife-blue bg-transparent text-myfinlife-blue hover:bg-myfinlife-blue-light focus:ring-myfinlife-blue/30',
      }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

