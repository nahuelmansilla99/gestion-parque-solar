import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportPanelesToCSV, exportInspeccionesToCSV, exportAllData } from './exportUtils';

export function Dashboard({ paneles }) {
    const [showExportMenu, setShowExportMenu] = useState(false);

    // 1. Calcular estadísticas en tiempo real
    const data = [
        { name: 'Críticos', value: 0, color: 'var(--status-critical)' }, // Rojo
        { name: 'Alerta', value: 0, color: 'var(--status-warning)' },   // Amarillo
        { name: 'Operativos', value: 0, color: 'var(--status-success)' },// Verde
        { name: 'Pendientes', value: 0, color: 'var(--status-dim)' } // Gris
    ];

    paneles.forEach(panel => {
        if (panel.ultimo_estado === 'CRITICO') data[0].value++;
        else if (panel.ultimo_estado === 'ALERTA') data[1].value++;
        else if (panel.ultimo_estado === 'OPERATIVO') data[2].value++;
        else data[3].value++; // Cualquier otro caso (null, PENDIENTE, etc)
    });

    // Filtrar los que tengan 0 para que no salgan feos en el gráfico
    const dataVisible = data.filter(item => item.value > 0);
    const totalPaneles = paneles.length;

    // Export handlers
    const handleExportAll = () => {
        exportAllData(paneles);
        setShowExportMenu(false);
    };

    const handleExportPaneles = () => {
        exportPanelesToCSV(paneles);
        setShowExportMenu(false);
    };

    const handleExportInspecciones = () => {
        exportInspeccionesToCSV(paneles);
        setShowExportMenu(false);
    };

    return (
        <div className="bg-surface p-5 rounded-xl shadow-lg mb-5 flex justify-around items-center flex-wrap border border-border">

            {/* SECCIÓN DE TEXTO / KPIs */}
            <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="m-0 text-muted text-sm uppercase tracking-wider font-semibold">Resumen del Parque</h2>

                    {/* Export Button with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-3 mx-3 py-1.5 bg-brand hover:bg-brand-secondary text-heading text-xs font-medium rounded-lg transition-all shadow-md shadow-brand/30"
                        >
                            <span>📥</span>
                            <span className="text-[var(--text-secondary)]">Exportar</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-2xl z-10 overflow-hidden">
                                <button
                                    onClick={handleExportAll}
                                    className="w-full text-left px-4 py-3 hover:bg-surface-light text-main transition-colors flex items-center gap-3"
                                >
                                    <span className="text-lg">📦</span>
                                    <div>
                                        <div className="font-medium">Todos los Datos</div>
                                        <div className="text-xs text-muted">Paneles + Inspecciones</div>
                                    </div>
                                </button>
                                <div className="border-t border-border"></div>
                                <button
                                    onClick={handleExportPaneles}
                                    className="w-full text-left px-4 py-3 hover:bg-surface-light text-main transition-colors flex items-center gap-3"
                                >
                                    <span className="text-lg">⚡</span>
                                    <div>
                                        <div className="font-medium">Solo Paneles</div>
                                        <div className="text-xs text-muted">Datos generales</div>
                                    </div>
                                </button>
                                <div className="border-t border-border"></div>
                                <button
                                    onClick={handleExportInspecciones}
                                    className="w-full text-left px-4 py-3 hover:bg-surface-light text-main transition-colors flex items-center gap-3"
                                >
                                    <span className="text-lg">🔍</span>
                                    <div>
                                        <div className="font-medium">Solo Inspecciones</div>
                                        <div className="text-xs text-muted">Histórico completo</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-5xl font-bold text-heading">
                    {totalPaneles} <span className="text-sm font-normal text-muted">Paneles Totales</span>
                </div>

                {/* Alerta de Acción Rápida */}
                {data[0].value > 0 && (
                    <div className="mt-4 p-3 border border-[var(--status-critical)] rounded-md text- flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span><strong>{data[0].value} Paneles Críticos</strong> requieren atención.</span>
                    </div>
                )}
            </div>

            {/* SECCIÓN DEL GRÁFICO */}
            <div className="w-[300px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dataVisible}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {dataVisible.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                            itemStyle={{ color: 'var(--text-main)' }}
                        />
                        <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}