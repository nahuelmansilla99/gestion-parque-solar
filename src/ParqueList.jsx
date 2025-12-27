import { useState } from 'react';
import { ParqueForm } from './ParqueForm';

export function ParqueList({ parques, onParqueCreado, onVerPaneles, onNuevaInspeccion }) {
    const [mostrarForm, setMostrarForm] = useState(false);

    const handleParqueCreado = () => {
        if (onParqueCreado) {
            onParqueCreado();
        }
        setMostrarForm(false);
    };

    if (!parques || parques.length === 0) {
        return (
            <div className="space-y-6">
                <div className="bg-surface/30 rounded-xl border border-border p-12 text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <h3 className="text-xl font-semibold text-heading mb-2">No hay parques registrados</h3>
                    <p className="text-muted mb-6">Registra tu primer parque solar</p>
                    <button
                        onClick={() => setMostrarForm(!mostrarForm)}
                        className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-brand-glow"
                    >
                        {mostrarForm ? 'Cancelar' : 'Nuevo Parque'}
                    </button>
                </div>

                {mostrarForm && (
                    <div className="animate-fadeIn">
                        <ParqueForm onParqueCreado={handleParqueCreado} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {mostrarForm && (
                <div className="animate-fadeIn">
                    <ParqueForm onParqueCreado={handleParqueCreado} />
                </div>
            )}

            <div className="bg-surface/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-lg font-semibold text-heading">Parques Registrados</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 bg-surface-light rounded text-muted border border-border-light">
                            Total: {parques.length}
                        </span>
                        <button
                            onClick={() => setMostrarForm(!mostrarForm)}
                            className="px-4 py-2 bg-brand hover:bg-brand-secondary text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-brand-glow flex items-center gap-2"
                        >
                            <span>{mostrarForm ? '✕' : '+'}</span>
                            {mostrarForm ? 'Cancelar' : 'Nuevo Parque'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background/50 text-muted text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium border-b border-border">ID</th>
                                <th className="p-4 font-medium border-b border-border">Cliente</th>
                                <th className="p-4 font-medium border-b border-border">Ubicación</th>
                                <th className="p-4 font-medium border-b border-border">Capacidad (MWp)</th>
                                <th className="p-4 font-medium border-b border-border">Fecha Registro</th>
                                <th className="p-4 font-medium border-b border-border text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {parques.map((parque) => (
                                <tr
                                    key={parque.id_parque}
                                    className="hover:bg-surface-light/30 transition-colors group"
                                >
                                    <td className="p-4 text-muted font-mono text-sm">
                                        #{parque.id_parque.toString().padStart(3, '0')}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-heading">{parque.nombre_cliente}</div>
                                    </td>
                                    <td className="p-4 text-main">
                                        {parque.ubicacion_geo}
                                    </td>
                                    <td className="p-4">
                                        <span className="text-brand-secondary font-semibold">
                                            {parque.capacidad_instalada} MWp
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted text-sm">
                                        {new Date(parque.created_at).toLocaleDateString('es-AR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => onNuevaInspeccion && onNuevaInspeccion(parque.id_parque)}
                                                className="px-3 py-1.5 text-xs font-medium bg-brand hover:bg-brand-secondary text-white rounded border border-brand-secondary hover:border-brand transition-all shadow-sm"
                                            >
                                                🔍 Nueva Inspección
                                            </button>
                                            <button
                                                onClick={() => onVerPaneles && onVerPaneles(parque.id_parque)}
                                                className="px-3 py-1.5 text-xs font-medium bg-surface-light hover:bg-brand text-heading rounded border border-border-light hover:border-brand-secondary transition-all shadow-sm"
                                            >
                                                Ver Paneles
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
