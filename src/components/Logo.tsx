import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'h-8 w-8',
      image: 'h-6 w-6',
      text: 'text-sm'
    },
    md: {
      container: 'h-10 w-10',
      image: 'h-8 w-8',
      text: 'text-base'
    },
    lg: {
      container: 'h-12 w-12',
      image: 'h-10 w-10',
      text: 'text-lg'
    },
    xl: {
      container: 'h-16 w-16',
      image: 'h-14 w-14',
      text: 'text-xl'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${currentSize.container} flex items-center justify-center bg-myfinlife-white rounded-hex shadow-myfinlife`}>
        <img
          src="/logo.png"
          alt="myfinlife"
          className={`${currentSize.image} object-contain`}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className={`${currentSize.text} font-bold text-myfinlife-blue tracking-wide`}>
          myfinlife
        </div>
      )}
    </div>
  )
}

// Componente só do ícone (para usar em lugares pequenos)
export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
  return (
    <Logo size={size} showText={false} className={className} />
  )
}




