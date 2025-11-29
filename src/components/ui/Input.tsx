import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-myfinlife-blue mb-1 font-montserrat">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 border rounded-hex focus:ring-2 focus:ring-myfinlife-blue/50 focus:border-transparent outline-none transition font-montserrat ${
            error ? 'border-danger-500' : 'border-myfinlife-blue-light'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-500 font-montserrat">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

