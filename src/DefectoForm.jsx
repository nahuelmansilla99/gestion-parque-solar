import { useState } from 'react'
import { supabase } from './supabase'

export function DefectoForm({ onCerrar, onDefectoCreado }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nombre_defecto: '',
        categoria: 'Termográfico',
        gravedad_sugerida: 'ALERTA'
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.nombre_defecto.trim()) {
            alert('Por favor ingresa el nombre del defecto')
            return
        }

        setLoading(true)

        const { data, error } = await supabase
            .from('new_catalogo_defectos')
            .insert([
                {
                    nombre_defecto: formData.nombre_defecto,
                    categoria: formData.categoria,
                    gravedad_sugerida: formData.gravedad_sugerida
                }
            ])
            .select('*')
            .single()

        setLoading(false)

        if (error) {
            alert('Error guardando defecto: ' + error.message)
        } else {
            alert('¡Tipo de defecto creado exitosamente!')
            if (onDefectoCreado && data) {
                onDefectoCreado(data)
            } else {
                onCerrar()
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface border border-border p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-heading">
                    <span className="text-brand-secondary">➕</span>
                    Nuevo Tipo de Defecto
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* NOMBRE DEL DEFECTO */}
                    <label className="flex flex-col">
                        <span className="font-medium text-main mb-2">Nombre del Defecto: *</span>
                        <input
                            type="text"
                            name="nombre_defecto"
                            value={formData.nombre_defecto}
                            onChange={handleChange}
                            placeholder="Ej: Celda caliente, Bypass activado..."
                            className="p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            required
                        />
                    </label>

                    {/* CATEGORÍA */}
                    <label className="flex flex-col">
                        <span className="font-medium text-main mb-2">Categoría:</span>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        >
                            <option value="Termográfico">🌡️ Termográfico</option>
                            <option value="Visual">👁️ Visual</option>
                            <option value="Eléctrico">⚡ Eléctrico</option>
                            <option value="Estructural">🔧 Estructural</option>
                            <option value="Otro">📋 Otro</option>
                        </select>
                    </label>

                    {/* GRAVEDAD SUGERIDA */}
                    <label className="flex flex-col">
                        <span className="font-medium text-main mb-2">Gravedad Sugerida:</span>
                        <select
                            name="gravedad_sugerida"
                            value={formData.gravedad_sugerida}
                            onChange={handleChange}
                            className="p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        >
                            <option value="OPERATIVO">✅ OPERATIVO</option>
                            <option value="ALERTA">⚠️ ALERTA</option>
                            <option value="CRITICO">🔴 CRITICO</option>
                        </select>
                    </label>

                    {/* BOTONES */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-brand text-heading font-medium rounded-lg hover:bg-brand-secondary disabled:bg-surface-light disabled:text-muted transition-all shadow-lg shadow-brand/30"
                        >
                            {loading ? 'Guardando...' : 'Crear Defecto'}
                        </button>
                        <button
                            type="button"
                            onClick={onCerrar}
                            disabled={loading}
                            className="px-4 py-2 bg-surface-light text-main font-medium rounded-lg hover:bg-border-light transition-colors border border-border-light disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
