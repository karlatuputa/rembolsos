'use client'
import { useState, useEffect } from "react"
import { Copy, Check, Plus, ExternalLink } from "lucide-react"
import { GeistMono } from "geist/font/mono"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Reembolso = {
  id: string
  monto: number
  clabe: string
  empresa: string
  telefono?: string | null
  fecha_creacion: string
  estado: 'pendiente' | 'completado' | 'rechazado'
  enlace_publico: string
    convenienceText?: string;  // nuevo texto completo

}

export default function PanelAdmin() {
  const [formData, setFormData] = useState({
    clabe: "",
    monto: "",
    telefono: "",
    empresa: "",
    convenienceText:"",
  })

  const [enlaceGenerado, setEnlaceGenerado] = useState("")
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([])
  const [copiado, setCopiado] = useState(false)
  const [filaCopiadaId, setFilaCopiadaId] = useState("")

  useEffect(() => {
    cargarReembolsos()
  }, [])

  const cargarReembolsos = async () => {
    const { data, error } = await supabase
      .from('reembolsos')
      .select('*')
      .order('fecha_creacion', { ascending: false })

    if (!error && data) setReembolsos(data)
  }

  const validarFormulario = () => {
    const { clabe, monto, empresa } = formData
    if (!empresa.trim()) {
      alert("El nombre de la empresa es requerido.")
      return false
    }
    if (!/^\d{18}$/.test(clabe)) {
      alert("La CLABE debe tener 18 dígitos numéricos.")
      return false
    }
if (!/^(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?$/.test(monto)) {
      alert("El monto debe ser un número válido (ej. 1234.56).")
      return false
    }
    return true
  }

  const generarEnlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    const enlacePublico = Math.random().toString(36).substring(2, 8)

    const { data, error } = await supabase
      .from('reembolsos')
      .insert({
    
        // Eliminar comas antes de parsear
        monto: parseFloat(formData.monto.replace(/,/g, '')),
        clabe: formData.clabe,
        telefono: formData.telefono || null,
        empresa: formData.empresa,
        enlace_publico: enlacePublico,
        convenienceText: formData.convenienceText, // Asegúrate de guardar e

      })
      .select()
      .single()

    if (error) {
      console.error("Error Supabase:", error)
      alert(`Error: ${error.message}`)
      return
    }

    setEnlaceGenerado(`/reembolso/${data.enlace_publico}`)
    cargarReembolsos()
    setFormData({ clabe: "", monto: "", telefono: "", empresa: "",convenienceText: "",          // nuevo
 })
  }

  const copiarPortapapeles = async (texto: string, esFila = false, id = "") => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${texto}`)
      if (esFila) {
        setFilaCopiadaId(id)
        setTimeout(() => setFilaCopiadaId(""), 2000)
      } else {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      }
    } catch (err) {
      alert("No se pudo copiar, intenta manualmente")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario Actualizado */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Crear nuevo reembolso</h2>
              <form onSubmit={generarEnlace} className="space-y-4">
                {/* Campos del formulario con nombres en español */}
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="empresa"
                    name="empresa"
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
  {/* Campo CLABE */}
  <div>
    <label htmlFor="clabe" className="block text-sm font-medium text-gray-700 mb-1">
      CLABE Interbancaria
    </label>
    <input
      type="text"
      id="clabe"
      name="clabe"
      value={formData.clabe}
      onChange={(e) => setFormData({...formData, clabe: e.target.value})}
      className={`${GeistMono.className} w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder="18 dígitos"
      maxLength={18}
      required
    />
  </div>

  {/* Campo Monto */}
  {/* Campo Monto con validación */}
<div>
  <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
    Monto (MXN)
  </label>
  <input
    type="text"
    id="monto"
    name="monto"
    value={formData.monto}
    onChange={(e) => {
      const value = e.target.value;
      // Permite: números, un solo punto, máximo 2 decimales
      if (value === '' || /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/.test(value)) {
        setFormData({...formData, monto: value});
      }
    }}
    onBlur={(e) => {
      // Validación final al salir del campo
      const numValue = parseFloat(e.target.value);
      if (isNaN(numValue)) {
        setFormData({...formData, monto: ''});
      } else {
        // Formatea a 2 decimales sin símbolo $
        setFormData({
          ...formData,
          monto: numValue.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            style: 'decimal', // Esto evita el símbolo $

          })
        });
      }
    }}
    className={`w-full px-3 py-2 border ${
      formData.monto && !/^\d{1,3}(,\d{3})*(\.\d{2})?$/.test(formData.monto)
        ? 'border-red-500'
        : 'border-gray-300'
    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
    placeholder="0.00"
    required
  />
  {formData.monto && !/^\d{1,3}(,\d{3})*(\.\d{2})?$/.test(formData.monto) && (
    <p className="mt-1 text-sm text-red-600">
      El monto debe ser un número válido (ej. 1234.56)
    </p>
  )}
</div>

  {/* Campo Teléfono */}
  <div>
    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
      Teléfono (opcional)
    </label>
    <input
      type="text"
      id="telefono"
      name="telefono"
      value={formData.telefono || ""}
      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="10 dígitos"
    />
  </div>
{/* Campo Barcode */}
<div>
  <label htmlFor="convenienceText" className="block text-sm font-medium text-gray-700 mb-1">
    Detalles
  </label>
  <input
    type="text"
    id="convenienceText"
    name="convenienceText"
    value={formData.convenienceText}
    onChange={(e) => setFormData({ ...formData, convenienceText: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>


  <button
    type="submit"
    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
  >
    <Plus className="h-4 w-4" />
    Generar link de reembolso
  </button>
                {/* Resto de campos... */}
              </form>

              {enlaceGenerado && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Enlace generado:</p>
                  <div className="flex items-center">
                    <div className={`${GeistMono.className} flex-1 bg-white border border-gray-300 rounded-l-lg p-2 text-sm truncate`}>
                      {enlaceGenerado}
                    </div>
                    <button
                      onClick={() => copiarPortapapeles(enlaceGenerado)}
                      className={`p-2 rounded-r-lg transition-colors ${copiado ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                    >
                      {copiado ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de Historial Actualizada */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Historial de reembolsos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Empresa", "Monto", "CLABE", "Estado", "Fecha", "Acción"].map((titulo) => (
                        <th key={titulo} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {titulo}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reembolsos.map((reembolso) => (
                      <tr key={reembolso.id}>
                        <td className="px-6 py-4 text-sm text-gray-700">{reembolso.empresa}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          }).format(Number(reembolso.monto))}
                        </td>
                        <td className={`${GeistMono.className} px-6 py-4 text-sm text-gray-500`}>
                          {reembolso.clabe.slice(0, 4)}...{reembolso.clabe.slice(-4)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reembolso.estado === 'completado' ? 'bg-green-100 text-green-800' :
                            reembolso.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reembolso.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(reembolso.fecha_creacion).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => copiarPortapapeles(`/reembolso/${reembolso.enlace_publico}`, true, reembolso.id)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                              filaCopiadaId === reembolso.id
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            }`}
                          >
                            {filaCopiadaId === reembolso.id ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copiar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}