"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { GeistMono } from "geist/font/mono"

interface RefundCardProps {
  id: string
  importe: string | number
  clabe: string
  empresa: string
  telefono?: string
  estado?: string
  convenienceText?: string
}

export function RefundCard({
  id,
  importe,
  clabe,
  empresa,
  telefono,
  estado,
  convenienceText,
}: RefundCardProps) {
  const [copied, setCopied] = useState(false)

  // Función para formatear el importe en formato mexicano sin símbolo $
  const formatImporte = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('es-MX', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(isNaN(numValue) ? 0 : numValue)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
      {/* Encabezado */}
      <div className="bg-white p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-800">Código de reembolso</h1>
        <p className="text-center text-gray-700 font-medium mt-1">{empresa}</p>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">
        {/* Sección de Reembolso en línea */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Reembolso en línea</h2>

          <div>
            <p className="text-sm text-gray-600 mb-1">Importe del pago (MXN)</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatImporte(importe)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Número de cuenta CLABE</p>
            <div className="flex items-center">
              <div
                className={`${GeistMono.className} flex-1 bg-gray-50 border border-gray-300 rounded-l-lg p-3 font-mono text-sm`}
              >
                {clabe || ""}
              </div>
              <button
                onClick={() => copyToClipboard(clabe)}
                className={`p-3 rounded-r-lg transition-colors ${
                  copied ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                aria-label="Copiar CLABE"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            {!clabe && <p className="text-red-500 text-sm mt-1">Por favor, copie la cuenta CLABE a utilizar</p>}
          </div>
        </section>

        {/* Separador */}
        <div className="border-t border-gray-200"></div>

        {/* Sección de Reembolso de tienda de conveniencia */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Reembolso de tienda de conveniencia</h2>

          <div>
            <p className="text-sm text-gray-600 mb-1">Importe del pago (MXN)</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatImporte(importe)}
            </p>
          </div>
        </section>

        {/* Texto de conveniencia */}
        {convenienceText && (
          <div className="mt-4">
            <p className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
              {convenienceText}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}