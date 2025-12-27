import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { DefectoForm } from './DefectoForm'

export function HallazgoForm({ idInspeccion, idPanel, panelInfo, onCerrar, onHallazgoCreado }) {
    const [loading, setLoading] = useState(false)
    const [tiposDefectos, setTiposDefectos] = useState([])
    const [mostrarFormDefecto, setMostrarFormDefecto] = useState(false)

    const [formData, setFormData] = useState({
        defectos_seleccionados: [], // Array de IDs de defectos
        valor_medio: '',
        estado_actual: 'OPERATIVO',
        foto_evidencia: '',
        comentario: ''
    })

    useEffect(() => {
        getTiposDefectos()
    }, [])

    async function getTiposDefectos() {
        const { data, error } = await supabase
            .from('new_catalogo_defectos')
            .select('*')
            .order('nombre_defecto')

        if (error) {
            console.log('Error cargando tipos de defectos:', error)
        } else {
            setTiposDefectos(data || [])
        }
    }

    const handleDefectoCreado = (nuevoDefecto) => {
        // Recargar la lista de defectos
        getTiposDefectos()
        // Seleccionar automáticamente el nuevo defecto
        setFormData(prev => ({
            ...prev,
            defectos_seleccionados: [...prev.defectos_seleccionados, nuevoDefecto.id_tipo_defecto]
        }))
        // Cerrar el formulario de defecto
        setMostrarFormDefecto(false)
    }

    const handleDefectoToggle = (idDefecto) => {
        setFormData(prev => ({
            ...prev,
            defectos_seleccionados: prev.defectos_seleccionados.includes(idDefecto)
                ? prev.defectos_seleccionados.filter(id => id !== idDefecto)
                : [...prev.defectos_seleccionados, idDefecto]
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.defectos_seleccionados.length === 0) {
            // alert('Por favor selecciona al menos un tipo de defecto')
            return
        }

        setLoading(true)

        // Crear un hallazgo por cada defecto seleccionado
        const hallazgos = formData.defectos_seleccionados.map(idDefecto => ({
            id_inspeccion: idInspeccion,
            id_panel: idPanel,
            id_tipo_defecto: parseInt(idDefecto),
            valor_medio: formData.valor_medio ? parseFloat(formData.valor_medio) : null,
            estado_actual: formData.estado_actual,
            foto_evidencia: formData.foto_evidencia || null,
            comentario: formData.comentario || null
        }))

        const { error } = await supabase
            .from('new_registo_hallazgos')
            .insert(hallazgos)

        setLoading(false)

        if (error) {
            // alert('Error guardando hallazgo: ' + error.message)
        } else {
            const mensaje = hallazgos.length === 1
                ? '¡Hallazgo registrado exitosamente!'
                : `¡${hallazgos.length} hallazgos registrados exitosamente!`
            // alert(mensaje)
            if (onHallazgoCreado) {
                onHallazgoCreado()
            } else {
                onCerrar()
            }
        }
    }

    return (
        <div className="border border-border p-6 mt-6 bg-surface text-heading rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-brand-secondary">📋</span>
                Registrar Hallazgo - Panel #{idPanel?.toString().padStart(3, '0')}
            </h3>

            {panelInfo && (
                <div className="mb-4 p-3 bg-surface-light/50 rounded-lg border border-border">
                    <div className="text-sm text-muted">
                        <span className="font-medium">Serie:</span> {panelInfo.serial_number || 'N/A'} |
                        <span className="font-medium ml-2">Modelo:</span> {panelInfo.marca_modelo || 'N/A'}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* TIPO DE DEFECTO */}
                <div className="p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-main">Tipos de Defecto: ({formData.defectos_seleccionados.length} seleccionados)</span>
                        <button
                            type="button"
                            onClick={() => setMostrarFormDefecto(true)}
                            className="px-3 py-2 bg-brand hover:bg-brand-secondary text-white font-bold rounded transition-all shadow-sm"
                            title="Agregar nuevo tipo de defecto"
                        >
                            +
                        </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-background rounded border border-border-light">
                        {tiposDefectos.length === 0 ? (
                            <p className="text-muted text-sm text-center py-4">No hay tipos de defectos. Presiona '+' para agregar uno.</p>
                        ) : (
                            tiposDefectos.map(defecto => (
                                <label
                                    key={defecto.id_tipo_defecto}
                                    className="flex items-start gap-3 p-2 hover:bg-surface-light/30 rounded cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.defectos_seleccionados.includes(defecto.id_tipo_defecto)}
                                        onChange={() => handleDefectoToggle(defecto.id_tipo_defecto)}
                                        className="mt-1 w-4 h-4 text-brand focus:ring-brand-secondary rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="text-heading font-medium">{defecto.nombre_defecto}</div>
                                        <div className="text-xs text-muted flex gap-2 mt-0.5">
                                            <span>{defecto.categoria}</span>
                                            <span>•</span>
                                            <span className={`${defecto.gravedad_sugerida === 'CRITICO' ? 'text-critical' :
                                                    defecto.gravedad_sugerida === 'ALERTA' ? 'text-warning' :
                                                        'text-success'
                                                }`}>
                                                {defecto.gravedad_sugerida}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>


                {/* VALOR MEDIO */}
                <label className="flex flex-col p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                    <span className="font-medium text-main mb-2">Valor Medio (Temperatura, etc.):</span>
                    <input
                        type="number"
                        step="0.01"
                        name="valor_medio"
                        value={formData.valor_medio}
                        onChange={handleChange}
                        placeholder="Ej: 85.5"
                        className="p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    />
                </label>

                {/* ESTADO ACTUAL */}
                <label className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                    <span className="font-medium text-main">Estado Actual:</span>
                    <select
                        name="estado_actual"
                        value={formData.estado_actual}
                        onChange={handleChange}
                        className="ml-3 p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    >
                        <option value="OPERATIVO">✅ OPERATIVO</option>
                        <option value="ALERTA">⚠️ ALERTA</option>
                        <option value="CRITICO">🔴 CRITICO</option>
                    </select>
                </label>

                {/* FOTO EVIDENCIA */}
                <label className="flex flex-col p-3 bg-surface-light/50 rounded-lg border border-border hover:border-brand-secondary/50 transition-colors">
                    <span className="font-medium text-main mb-2">Foto Evidencia (URL o Base64):</span>
                    <input
                        type="text"
                        name="foto_evidencia"
                        value={formData.foto_evidencia}
                        onChange={handleChange}
                        placeholder="https://... o data:image/..."
                        className="p-2 border border-border-light rounded bg-background text-heading focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    />
                </label>

                {/* COMENTARIO */}
                <label className="flex flex-col">
                    <span className="font-medium mb-2 text-muted">Comentario (Opcional):</span>
                    <textarea
                        name="comentario"
                        value={formData.comentario}
                        onChange={handleChange}
                        rows="3"
                        className="p-3 border border-border-light rounded-lg bg-background text-heading w-full focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        placeholder="Escribe observaciones adicionales sobre el hallazgo..."
                    />
                </label>

                {/* BOTONES */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-brand text-[var(--text-secondary)] font-medium rounded-lg hover:bg-brand-secondary disabled:bg-surface-light disabled:text-muted transition-all shadow-lg shadow-brand/30"
                    >
                        {loading ? 'Guardando...' : 'Guardar Hallazgo'}
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

            {/* MODAL DE NUEVO DEFECTO */}
            {mostrarFormDefecto && (
                <DefectoForm
                    onCerrar={() => setMostrarFormDefecto(false)}
                    onDefectoCreado={handleDefectoCreado}
                />
            )}
        </div>
    )
}
