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

        // 1. Lógica AUTOMÁTICA de Estado (Tu estrategia condicional)
        let estadoCalculado = 'OPERATIVO' // Verde por defecto

        // Si hay hotspot alto (>20ºC) o falla la sujeción -> CRITICO
        if (formData.temp_hotspot > 20 || !formData.sujecion_ok) {
            estadoCalculado = 'CRITICO'
        } else if (formData.limpieza === 'Baja') {
            estadoCalculado = 'ALERTA'
        }

        // 2. Guardar en Supabase
        const { error } = await supabase
            .from('inspecciones')
            .insert([
                {
                    panel_id: panelId,
                    limpieza: formData.limpieza,
                    sujecion_ok: formData.sujecion_ok,
                    temp_hotspot: parseFloat(formData.temp_hotspot),
                    observaciones: formData.observaciones,
                    estado_calculado: estadoCalculado, // ¡La magia!
                    tecnico_nombre: 'Nahuel' // Hardcodeado por ahora
                }
            ])

        setLoading(false)
        if (error) {
            alert('Error guardando: ' + error.message)
        } else {
            alert('¡Inspección Guardada! Estado: ' + estadoCalculado)
            onCerrar() // Cierra el formulario
        }
    }

    return (
        <div style={{ border: '2px solid #ccc', padding: '20px', marginTop: '10px', background: '#f9f9f9', color: '#333' }}>
            <h3>Inspeccionando Panel #{panelId}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* CHECKLIST VISUAL */}
                <label>
                    Nivel de Limpieza:
                    <select name="limpieza" value={formData.limpieza} onChange={handleChange} style={{ marginLeft: '10px' }}>
                        <option value="Alta">Alta (Limpio)</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja (Sucio)</option>
                    </select>
                </label>

                <label>
                    <input
                        type="checkbox"
                        name="sujecion_ok"
                        checked={formData.sujecion_ok}
                        onChange={handleChange}
                    />
                    ¿Sujeción e Integridad OK?
                </label>

                {/* INSTRUMENTOS (Termografía) */}
                <label>
                    Temp. Max Hotspot (ºC):
                    <input
                        type="number"
                        name="temp_hotspot"
                        value={formData.temp_hotspot}
                        onChange={handleChange}
                        style={{ marginLeft: '10px', width: '60px' }}
                    />
                </label>

                <label>
                    Observaciones:
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                    />
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Inspección'}
                    </button>
                    <button type="button" onClick={onCerrar}>Cancelar</button>
                </div>
            </form>
        </div>
    )
}