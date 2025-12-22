import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { InspeccionForm } from './InspeccionForm'
import { Dashboard } from './Dashboard'
import { Navigation } from './Navigation'
import { ParqueForm } from './ParqueForm'
import { ParqueList } from './ParqueList'

function App() {
  const [paneles, setPaneles] = useState([])
  const [panelSeleccionado, setPanelSeleccionado] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [parques, setParques] = useState([])

  useEffect(() => {
    getPaneles()
    getParques()
  }, [panelSeleccionado])

  async function getPaneles() {
    const { data, error } = await supabase
      .from('paneles')
      .select(`
        *,
        inspecciones (
          temp_hotspot,
          limpieza,
          sujecion_ok,
          estado_calculado,
          created_at
        )
      `)
      .order('id', { ascending: true })

    if (error) console.log('Error:', error)
    else setPaneles(data)
  }

  async function getParques() {
    const { data, error } = await supabase
      .from('new_parque')
      .select('*')
      .order('id_parque', { ascending: true })

    if (error) console.log('Error:', error)
    else setParques(data)
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
    if (panel.ultimo_estado === 'PENDIENTE') return <span className="text-gray-500">-</span>;
    if (panel.ultimo_estado === 'OPERATIVO') return <span className="text-green-400">Rendimiento óptimo</span>;

    // Buscar la última inspección
    if (!panel.inspecciones || panel.inspecciones.length === 0) return <span className="text-gray-500">Sin datos</span>;

    // Ordenar por fecha (más reciente primero) si vienen desordenadas
    const inspecciones = panel.inspecciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const last = inspecciones[0];

    if (last.estado_calculado === 'CRITICO') {
      if (last.temp_hotspot > 20) return <span className="text-critical">🔥 Hotspot: {last.temp_hotspot}ºC</span>;
      if (!last.sujecion_ok) return <span className="text-critical">⚠️ Sujeción Fallida</span>;
    }
    if (last.estado_calculado === 'ALERTA') {
      if (last.limpieza === 'Baja') return <span className="text-warning">🧹 Limpieza Requerida</span>;
    }

    return <span className="text-muted">Ver detalles</span>;
  }

  return (
    <div className="min-h-screen bg-background text-main p-8 font-sans">

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center text-heading font-bold text-xl shadow-lg shadow-blue-900/50">
              ⚡
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-heading">SolarCondicional <span className="text-brand-secondary">Manager</span></h1>
          </div>
          <div className="text-sm text-muted">
            Parque Fotovoltaico "La Luz 1"
          </div>
        </header>

        {/* NAVIGATION */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {!panelSeleccionado && <Dashboard paneles={paneles} />}

            {panelSeleccionado ? (
              <InspeccionForm
                panelId={panelSeleccionado}
                onCerrar={() => setPanelSeleccionado(null)}
              />
            ) : (
              <div className="bg-surface/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                  <h2 className="text-lg font-semibold text-heading">Estado de Paneles en Tiempo Real</h2>
                  <span className="text-xs px-2 py-1 bg-surface-light rounded text-muted border border-border-light">Total: {paneles.length}</span>
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
                          key={panel.id}
                          className="hover:bg-surface-light/30 transition-colors group"
                        >
                          <td className="p-4 text-muted font-mono text-sm">
                            #{panel.id.toString().padStart(3, '0')}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-heading">{panel.codigo_serie}</div>
                            <div className="text-xs text-muted">{panel.modelo}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(panel.ultimo_estado)}`}></div>
                              <span className={`text-sm font-medium ${panel.ultimo_estado === 'CRITICO' ? 'text-critical' :
                                panel.ultimo_estado === 'ALERTA' ? 'text-warning' :
                                  panel.ultimo_estado === 'OPERATIVO' ? 'text-success' :
                                    'text-muted'
                                }`}>
                                {panel.ultimo_estado || 'PENDIENTE'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-medium">
                            {getDiagnostico(panel)}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setPanelSeleccionado(panel.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-surface-light hover:bg-brand text-heading rounded border border-border-light hover:border-brand-secondary transition-all shadow-sm"
                            >
                              {panel.ultimo_estado === 'PENDIENTE' ? 'Realizar Inspección' : 'Ver / Editar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* PARQUES TAB */}
        {activeTab === 'parques' && (
          <div className="space-y-6">
            <ParqueForm onParqueCreado={getParques} />
            <ParqueList parques={parques} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App