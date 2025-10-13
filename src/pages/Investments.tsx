import { Card } from '@/components/ui/Card'

export function Investments() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
          <p className="text-gray-600 mt-2">Gerencie seu portfólio de investimentos</p>
        </div>
        
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Investimentos em Desenvolvimento
          </h2>
          <p className="text-gray-600">
            Esta funcionalidade estará disponível em breve. Aqui você poderá gerenciar seu portfólio de investimentos.
          </p>
        </Card>
      </div>
    </div>
  )
}
