export function PanelesList({
    paneles,
    parqueSeleccionado,
    parques,
    inspeccionActiva,
    onLimpiarFiltro,
    onRegistrarHallazgo,
    onSeleccionarPanel
}) {
    // Obtener el último estado del panel basado en sus hallazgos
    const getEstadoPanel = (panel) => {
        if (!panel.new_registo_hallazgos || panel.new_registo_hallazgos.length === 0) {
            return 'PENDIENTE'
        }

        // Ordenar hallazgos por fecha (más reciente primero)
        const hallazgosOrdenados = [...panel.new_registo_hallazgos].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )

        return hallazgosOrdenados[0].estado_actual || 'PENDIENTE'
    }

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'CRITICO': return 'bg-[var(--status-critical)] shadow-[0_0_8px_rgba(239,68,68,0.6)]';
            case 'ALERTA': return 'bg-[var(--status-warning)] shadow-[0_0_8px_rgba(234,179,8,0.6)]';
            case 'OPERATIVO': return 'bg-[var(--status-success)] shadow-[0_0_8px_rgba(34,197,94,0.6)]';
            default: return 'bg-[var(--status-dim)]';
        }
    }

    const getDiagnostico = (panel) => {
        const estadoActual = getEstadoPanel(panel)

        if (estadoActual === 'PENDIENTE') return <span className="text-gray-500">-</span>;
        if (estadoActual === 'OPERATIVO') return <span className="text-green-400">Rendimiento óptimo</span>;

        // Las inspecciones ahora vienen dentro de los hallazgos
        if (!panel.new_registo_hallazgos || panel.new_registo_hallazgos.length === 0) {
            return <span className="text-gray-500">Sin datos</span>;
        }

        // Buscar inspecciones en los hallazgos
        const inspeccionesDesdeHallazgos = panel.new_registo_hallazgos
            .map(hallazgo => hallazgo.new_inspecciones)
            .filter(inspeccion => inspeccion !== null)
            .flat();

        if (inspeccionesDesdeHallazgos.length === 0) {
            return <span className="text-gray-500">Sin datos</span>;
        }

        // Ordenar por fecha (más reciente primero)
        const inspecciones = inspeccionesDesdeHallazgos.sort((a, b) =>
            new Date(b.fecha_inspeccion) - new Date(a.fecha_inspeccion)
        );
        const last = inspecciones[0];

        // Retornar información básica de la inspección
        if (last.tipo_inspeccion) {
            return <span className="text-muted">📋 {last.tipo_inspeccion} - {last.tecnico_responsable || 'Sin técnico'}</span>;
        }

        return <span className="text-muted">Ver detalles</span>;
    }

    return (
        <div className="bg-surface/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-heading">Estado de Paneles en Tiempo Real</h2>
                    {parqueSeleccionado && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-3 py-1 bg-brand/20 rounded-lg text-brand-secondary border border-brand/30">
                                📍 Parque #{parqueSeleccionado} - {parques.find(p => p.id_parque === parqueSeleccionado)?.nombre_cliente}
                            </span>
                            <button
                                onClick={onLimpiarFiltro}
                                className="text-xs px-2 py-1 bg-surface-light hover:bg-brand/10 text-muted hover:text-heading rounded border border-border-light hover:border-brand transition-all"
                                title="Ver todos los paneles"
                            >
                                ✕ Ver todos
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 bg-surface-light rounded text-muted border border-border-light">Total: {paneles.length}</span>
                    {inspeccionActiva && (
                        <span
                            className="px-4 py-2 bg-brand hover:bg-brand-secondary text-[var(--text-secondary)] text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-brand-glow flex items-center gap-2"
                        >
                            🔍 Modo Inspección Activo
                        </span>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background/50 text-muted text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium border-b border-border">Panel ID</th>
                            <th className="p-4 font-medium border-b border-border">Modelo / Serie</th>
                            <th className="p-4 font-medium border-b border-border">Estado</th>
                            <th className="p-4 font-medium border-b border-border">Diagnóstico / Rendimiento</th>
                            <th className="p-4 font-medium border-b border-border text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {paneles.map((panel) => (
                            <tr
                                key={panel.id_panel}
                                className="hover:bg-surface-light/30 transition-colors group"
                            >
                                <td className="p-4 text-muted font-mono text-sm">
                                    #{panel.id_panel.toString().padStart(3, '0')}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-heading">{panel.serial_number || 'N/A'}</div>
                                    <div className="text-xs text-muted">{panel.marca_modelo || 'Sin modelo'}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(getEstadoPanel(panel))}`}></div>
                                        <span className={`text-sm font-medium ${getEstadoPanel(panel) === 'CRITICO' ? 'text-critical' :
                                            getEstadoPanel(panel) === 'ALERTA' ? 'text-warning' :
                                                getEstadoPanel(panel) === 'OPERATIVO' ? 'text-success' :
                                                    'text-muted'
                                            }`}>
                                            {getEstadoPanel(panel)}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-medium">
                                    {getDiagnostico(panel)}
                                </td>
                                <td className="p-4 text-right">
                                    {inspeccionActiva ? (
                                        <button
                                            onClick={() => onRegistrarHallazgo(panel)}
                                            className="px-3 py-1.5 text-xs font-medium bg-brand hover:bg-brand-secondary text-white rounded border border-brand-secondary hover:border-brand transition-all shadow-sm"
                                        >
                                            📋 Registrar Hallazgo
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onSeleccionarPanel(panel.id_panel)}
                                            className="px-3 py-1.5 text-xs font-medium bg-surface-light hover:bg-brand text-heading rounded border border-border-light hover:border-brand-secondary transition-all shadow-sm"
                                        >
                                            {getEstadoPanel(panel) === 'PENDIENTE' ? 'Realizar Inspección' : 'Ver / Editar'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
