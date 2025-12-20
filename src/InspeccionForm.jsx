import { useState } from 'react'
import { supabase } from './supabase'

export function InspeccionForm({ panelId, onCerrar }) {
    const [loading, setLoading] = useState(false)

    // Estados para tus datos de campo
    const [formData, setFormData] = useState({
        limpieza: 'Media',      // Default
        sujecion_ok: true,      // Checkbox
        temp_hotspot: 0,        // Termografía
        observaciones: ''
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // 1. Lógica del Semáforo
        let estadoCalculado = 'OPERATIVO'
        if (formData.temp_hotspot > 20 || !formData.sujecion_ok) {
            estadoCalculado = 'CRITICO'
        } else if (formData.limpieza === 'Baja') {
            estadoCalculado = 'ALERTA'
        }

        // 2. Guardar el Historial (Inspecciones)
        const { error: errorInsert } = await supabase
            .from('inspecciones')
            .insert([
                {
                    panel_id: panelId,
                    limpieza: formData.limpieza,
                    sujecion_ok: formData.sujecion_ok,
                    temp_hotspot: parseFloat(formData.temp_hotspot),
                    observaciones: formData.observaciones,
                    estado_calculado: estadoCalculado,
                    tecnico_nombre: 'Nahuel'
                }
            ])

        // 3. Actualizar el estado actual del Panel (Para que se vea en la lista)
        const { error: errorUpdate } = await supabase
            .from('paneles')
            .update({ ultimo_estado: estadoCalculado })
            .eq('id', panelId)

        setLoading(false)

        if (errorInsert || errorUpdate) {
            alert('Error guardando datos')
        } else {
            alert('¡Panel Actualizado a: ' + estadoCalculado + '!')
            onCerrar() // Cierra y vuelve a la lista
        }
    }

    return (
        <div className="border border-border p-6 mt-6 bg-surface text-heading rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-brand-secondary">🔍</span> Inspeccionando Panel #{panelId}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* CHECKLIST VISUAL */}
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                        <span className="font-medium text-main">Nivel de Limpieza:</span>
                        <select
                            name="limpieza"
                            value={formData.limpieza}
                            onChange={handleChange}
                            className="ml-3 p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        >
                            <option value="Alta">Alta (Limpio)</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja (Sucio)</option>
                        </select>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors cursor-pointer">
                        <span className="font-medium text-main">¿Sujeción e Integridad OK?</span>
                        <input
                            type="checkbox"
                            name="sujecion_ok"
                            checked={formData.sujecion_ok}
                            onChange={handleChange}
                            className="h-5 w-5 rounded border-border-light bg-background text-brand focus:ring-brand-secondary"
                        />
                    </label>

                    {/* INSTRUMENTOS (Termografía) */}
                    <label className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                        <span className="font-medium text-main flex items-center gap-2">
                            <span>🌡️</span> Temp. Max Hotspot (ºC):
                        </span>
                        <input
                            type="number"
                            name="temp_hotspot"
                            value={formData.temp_hotspot}
                            onChange={handleChange}
                            className="ml-3 w-24 p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary text-right"
                        />
                    </label>
                </div>

                <label className="flex flex-col">
                    <span className="font-medium mb-2 text-muted">Observaciones:</span>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                        className="p-3 border border-border-light rounded-lg bg-background text-heading w-full focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        placeholder="Escribe aquí notas adicionales del técnico..."
                    />
                </label>

                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-brand text-heading font-medium rounded-lg hover:bg-brand-secondary disabled:bg-surface-light disabled:text-muted transition-all shadow-lg shadow-brand/30"
                    >
                        {loading ? 'Guardando...' : 'Guardar Inspección'}
                    </button>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="px-4 py-2 bg-surface-light text-main font-medium rounded-lg hover:bg-border-light transition-colors border border-border-light"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}