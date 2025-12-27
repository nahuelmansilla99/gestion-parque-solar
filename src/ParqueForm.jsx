import { useState } from 'react';
import { supabase } from './supabase';

export function ParqueForm({ onParqueCreado }) {
    const [formData, setFormData] = useState({
        nombre_cliente: '',
        ubicacion_geo: '',
        capacidad_instalada: ''
    });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!formData.nombre_cliente || !formData.ubicacion_geo || !formData.capacidad_instalada) {
            setMensaje({ tipo: 'error', texto: 'Todos los campos son obligatorios' });
            return;
        }

        setLoading(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const { data, error } = await supabase
                .from('new_parque')
                .insert([
                    {
                        nombre_cliente: formData.nombre_cliente,
                        ubicacion_geo: formData.ubicacion_geo,
                        capacidad_instalada: parseFloat(formData.capacidad_instalada)
                    }
                ])
                .select();

            if (error) throw error;

            setMensaje({ tipo: 'success', texto: '✅ Parque registrado exitosamente' });
            setFormData({ nombre_cliente: '', ubicacion_geo: '', capacidad_instalada: '' });

            // Notificar al componente padre para actualizar la lista
            if (onParqueCreado) {
                onParqueCreado();
            }
        } catch (error) {
            console.error('Error al registrar parque:', error);
            setMensaje({ tipo: 'error', texto: `❌ Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface/50 backdrop-blur-sm rounded-xl border border-border p-6 shadow-2xl max-w-2xl">
            <h2 className="text-2xl font-bold text-heading mb-6 flex items-center gap-2">
                <span className="text-3xl">⚡</span>
                Registrar Nuevo Parque Solar
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre del Cliente */}
                <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                        Nombre del Cliente *
                    </label>
                    <input
                        type="text"
                        name="nombre_cliente"
                        value={formData.nombre_cliente}
                        onChange={handleChange}
                        placeholder="Ej: Empresa Solar S.A."
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                    />
                </div>

                {/* Ubicación Geográfica */}
                <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                        Ubicación Geográfica *
                    </label>
                    <input
                        type="text"
                        name="ubicacion_geo"
                        value={formData.ubicacion_geo}
                        onChange={handleChange}
                        placeholder="Ej: -34.6037, -58.3816 o Buenos Aires, Argentina"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                    />
                </div>

                {/* Capacidad Instalada */}
                <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                        Capacidad Instalada (MWp) *
                    </label>
                    <input
                        type="number"
                        name="capacidad_instalada"
                        value={formData.capacidad_instalada}
                        onChange={handleChange}
                        placeholder="Ej: 5.5"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-muted mt-1">Ingrese la capacidad en Megavatios pico (MWp)</p>
                </div>

                {/* Mensaje de feedback */}
                {mensaje.texto && (
                    <div className={`p-4 rounded-lg border ${mensaje.tipo === 'success'
                        ? 'bg-status-success/10 border-status-success/50 text-status-success'
                        : 'bg-status-critical/10 border-status-critical/50 text-status-critical'
                        }`}>
                        {mensaje.texto}
                    </div>
                )}

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-brand hover:bg-brand-secondary text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-brand-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Registrando...' : 'Registrar Parque'}
                </button>
            </form>
        </div>
    );
}
