import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative bg-myfinlife-white rounded-hex shadow-myfinlife-lg w-full ${sizes[size]} transform transition-all`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-myfinlife-blue-light">
              <h3 className="text-xl font-semibold text-myfinlife-blue font-montserrat">{title}</h3>
              <button
                onClick={onClose}
                className="text-myfinlife-blue/40 hover:text-myfinlife-blue/70 transition-colors rounded-hex p-1"
              >
                <X size={24} />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className={title ? "p-6" : "p-6"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

