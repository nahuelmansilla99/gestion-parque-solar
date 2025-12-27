import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { InspeccionForm } from './InspeccionForm'
import { HallazgoForm } from './HallazgoForm'
import { Dashboard } from './Dashboard'
import { Navigation } from './Navigation'
import { ParqueList } from './ParqueList'

function App() {
  const [paneles, setPaneles] = useState([])
  const [panelSeleccionado, setPanelSeleccionado] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [parques, setParques] = useState([])
  const [parqueSeleccionado, setParqueSeleccionado] = useState(null)
  const [parqueParaInspeccion, setParqueParaInspeccion] = useState(null)
  const [inspeccionActiva, setInspeccionActiva] = useState(null)
  const [panelParaHallazgo, setPanelParaHallazgo] = useState(null)

  useEffect(() => {
    getPaneles()
    getParques()
  }, [panelSeleccionado, parqueSeleccionado])

  async function getPaneles() {
    // 1. Seleccionamos solo los datos del panel primero para asegurar que carguen
    // Nota: Quitamos "new_inspecciones!id_panel" porque esa relación ya no existe en tu diagrama nuevo
    let query = supabase
      .from('new_inventario_paneles')
      .select(`
        *
      `)

    // 2. Este es el filtro importante que querías
    // Si hay un parque seleccionado, filtramos por su ID
    if (parqueSeleccionado) {
      query = query.eq('id_parque', parqueSeleccionado)
    }

    query = query.order('id_panel', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.log('Error cargando paneles:', error.message)
    } else {
      setPaneles(data)
    }
  }

  async function getParques() {
    const { data, error } = await supabase
      .from('new_parque')
      .select('*')
      .order('id_parque', { ascending: true })

    if (error) console.log('Error:', error)
    else setParques(data)
  }

  const handleVerPaneles = (idParque) => {
    // Guardar el parque seleccionado y cambiar a la pestaña de dashboard
    setParqueSeleccionado(idParque)
    setActiveTab('dashboard')
  }

  const limpiarFiltroParque = () => {
    setParqueSeleccionado(null)
  }

  const handleNuevaInspeccion = (idParque) => {
    setParqueParaInspeccion(idParque)
  }

  const handleInspeccionCreada = (idParque, idInspeccion) => {
    // Cerrar el formulario de inspección
    setParqueParaInspeccion(null)
    // Guardar la inspección activa
    setInspeccionActiva(idInspeccion)
    // Navegar al dashboard con el parque seleccionado
    setParqueSeleccionado(idParque)
    setActiveTab('dashboard')
  }

  const limpiarModoInspeccion = () => {
    setInspeccionActiva(null)
    setPanelParaHallazgo(null)
  }

  const handleRegistrarHallazgo = (panel) => {
    setPanelParaHallazgo(panel)
  }

  const handleHallazgoCreado = () => {
    setPanelParaHallazgo(null)
    // Recargar paneles para actualizar la vista
    getPaneles()
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
    if (!panel.new_inspecciones || panel.new_inspecciones.length === 0) return <span className="text-gray-500">Sin datos</span>;

    // Ordenar por fecha (más reciente primero) si vienen desordenadas
    const inspecciones = panel.new_inspecciones.sort((a, b) => new Date(b.fecha_inspeccion) - new Date(a.fecha_inspeccion));
    const last = inspecciones[0];

    // Retornar información básica de la inspección
    if (last.tipo_inspeccion) {
      return <span className="text-muted">📋 {last.tipo_inspeccion} - {last.tecnico_responsable || 'Sin técnico'}</span>;
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
            Parque Fotovoltaico "La Luz 1" <span className="text-xs px-2 py-1 bg-surface rounded text-warning border border-border">(TEST)</span>
          </div>
        </header>

        {/* NAVIGATION */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {!panelSeleccionado && <Dashboard paneles={paneles} />}

            {panelParaHallazgo ? (
              <HallazgoForm
                idInspeccion={inspeccionActiva}
                idPanel={panelParaHallazgo.id_panel}
                panelInfo={panelParaHallazgo}
                onCerrar={() => setPanelParaHallazgo(null)}
                onHallazgoCreado={handleHallazgoCreado}
              />
            ) : panelSeleccionado ? (
              <div className="text-center text-muted p-8">
                Panel seleccionado: {panelSeleccionado}
              </div>
            ) : (
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
                          onClick={limpiarFiltroParque}
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
                      <button
                        onClick={limpiarModoInspeccion}
                        className="px-4 py-2 bg-brand hover:bg-brand-secondary text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-brand-glow flex items-center gap-2"
                        title="Desactivar modo inspección"
                      >
                        🔍 Modo Inspección Activo
                      </button>
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
                          key={panel.id}
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
                            {inspeccionActiva ? (
                              <button
                                onClick={() => handleRegistrarHallazgo(panel)}
                                className="px-3 py-1.5 text-xs font-medium bg-brand hover:bg-brand-secondary text-white rounded border border-brand-secondary hover:border-brand transition-all shadow-sm"
                              >
                                📋 Registrar Hallazgo
                              </button>
                            ) : (
                              <button
                                onClick={() => setPanelSeleccionado(panel.id_panel)}
                                className="px-3 py-1.5 text-xs font-medium bg-surface-light hover:bg-brand text-heading rounded border border-border-light hover:border-brand-secondary transition-all shadow-sm"
                              >
                                {panel.ultimo_estado === 'PENDIENTE' ? 'Realizar Inspección' : 'Ver / Editar'}
                              </button>
                            )}
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
          <>
            {parqueParaInspeccion ? (
              <InspeccionForm
                parqueId={parqueParaInspeccion}
                onCerrar={() => setParqueParaInspeccion(null)}
                onInspeccionCreada={handleInspeccionCreada}
              />
            ) : (
              <ParqueList
                parques={parques}
                onParqueCreado={getParques}
                onVerPaneles={handleVerPaneles}
                onNuevaInspeccion={handleNuevaInspeccion}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App