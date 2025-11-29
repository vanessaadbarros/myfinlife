import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const baseStyles = 'font-montserrat font-medium rounded-full inline-flex items-center justify-center'
  
  const variants = {
    default: 'bg-myfinlife-blue-light text-myfinlife-blue',
    success: 'bg-success-500 text-myfinlife-white',
    warning: 'bg-warning-500 text-myfinlife-white',
    danger: 'bg-danger-500 text-myfinlife-white',
    info: 'bg-myfinlife-blue text-myfinlife-white',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span className={`
      ${baseStyles}
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  )
}




