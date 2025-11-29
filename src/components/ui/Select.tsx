import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-myfinlife-blue mb-1 font-montserrat">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2 border rounded-hex focus:ring-2 focus:ring-myfinlife-blue/50 focus:border-transparent outline-none transition font-montserrat bg-myfinlife-white ${
            error ? 'border-danger-500' : 'border-myfinlife-blue-light'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-danger-500 font-montserrat">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'




