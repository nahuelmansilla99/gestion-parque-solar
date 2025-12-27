import { useState } from 'react'
import { supabase } from './supabase'

export function InspeccionForm({ parqueId, onCerrar }) {
    const [loading, setLoading] = useState(false)

    // Estados para tus datos de campo
    const [formData, setFormData] = useState({
        tecnico_responsable: '',
        clima: 'Soleado',
        tipo_inspeccion: 'Termográfica',
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

        // Guardar la inspección en la nueva tabla
        const { error: errorInsert } = await supabase
            .from('new_inspecciones')
            .insert([
                {
                    id_parque: parqueId,
                    fecha_inspeccion: new Date().toISOString(),
                    tecnico_responsable: formData.tecnico_responsable,
                    clima: formData.clima,
                    tipo_inspeccion: formData.tipo_inspeccion,
                    observaciones: formData.observaciones
                }
            ])

        setLoading(false)

        if (errorInsert) {
            alert('Error guardando datos: ' + errorInsert.message)
        } else {
            alert('¡Inspección registrada exitosamente!')
            onCerrar() // Cierra y vuelve a la lista
        }
    }

    return (
        <div className="border border-border p-6 mt-6 bg-surface text-heading rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-brand-secondary">🔍</span> Nueva Inspección del Parque #{parqueId}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* DATOS DE INSPECCIÓN */}
                <div className="space-y-4">
                    <label className="flex flex-col p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                        <span className="font-medium text-main mb-2">Técnico Responsable:</span>
                        <input
                            type="text"
                            name="tecnico_responsable"
                            value={formData.tecnico_responsable}
                            onChange={handleChange}
                            placeholder="Nombre del técnico"
                            className="p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                        <span className="font-medium text-main">Clima:</span>
                        <select
                            name="clima"
                            value={formData.clima}
                            onChange={handleChange}
                            className="ml-3 p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        >
                            <option value="Soleado">☀️ Soleado</option>
                            <option value="Nublado">☁️ Nublado</option>
                            <option value="Lluvioso">🌧️ Lluvioso</option>
                            <option value="Ventoso">💨 Ventoso</option>
                        </select>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                        <span className="font-medium text-main">Tipo de Inspección:</span>
                        <select
                            name="tipo_inspeccion"
                            value={formData.tipo_inspeccion}
                            onChange={handleChange}
                            className="ml-3 p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        >
                            <option value="Termográfica">🌡️ Termográfica</option>
                            <option value="Visual">👁️ Visual</option>
                            <option value="Eléctrica">⚡ Eléctrica</option>
                            <option value="Mantenimiento">🔧 Mantenimiento</option>
                        </select>
                    </label>
                </div>

                <label className="flex flex-col">
                    <span className="font-medium mb-2 text-muted">Observaciones (Opcional):</span>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                        className="p-3 border border-border-light rounded-lg bg-background text-heading w-full focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        placeholder="Escribe aquí notas adicionales de la inspección..."
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