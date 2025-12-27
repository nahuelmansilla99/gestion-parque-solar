import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { InspeccionForm } from './InspeccionForm'
import { HallazgoForm } from './HallazgoForm'
import { Dashboard } from './Dashboard'
import { ParqueList } from './ParqueList'
import { PanelesList } from './PanelesList'

function App() {
  const [paneles, setPaneles] = useState([])
  const [panelSeleccionado, setPanelSeleccionado] = useState(null)
  const [activeTab, setActiveTab] = useState('parques')
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
    // Cargar paneles con sus hallazgos (y las inspecciones a través de los hallazgos)
    console.log('Cargando paneles. Parque seleccionado:', parqueSeleccionado)
    let query = supabase
      .from('new_inventario_paneles')
      .select(`
        *,
        new_registo_hallazgos (
          id_hallazgo,
          estado_actual,
          created_at,
          new_inspecciones (
            id_inspeccion,
            fecha_inspeccion,
            tipo_inspeccion,
            tecnico_responsable
          )
        )
      `)

    // 2. Este es el filtro importante que querías
    // Si hay un parque seleccionado, filtramos por su ID
    if (parqueSeleccionado) {
      query = query.eq('id_parque', parqueSeleccionado)
    }

    query = query.order('id_panel', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.log('❌ Error cargando paneles:', error.message)
    } else {
      console.log(`✅ Paneles cargados: ${data?.length || 0}`, data)
      if (data && data.length > 0) {
        console.log('📋 Primer panel:', data[0])
        console.log('📋 Campos disponibles:', Object.keys(data[0]))
      }
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
    setActiveTab('parques')
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

  return (
    <div className="min-h-screen bg-background text-main p-8 font-sans">

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center text-heading font-bold text-xl shadow-lg shadow-blue-900/50">
              ⚡
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-heading"><span className="text-brand-secondary">Auditoria</span> Parque Solar</h1>
          </div>
          <div className="text-sm text-muted">
            Parque Fotovoltaico "La Luz 1" <span className="text-xs px-2 py-1 bg-surface rounded text-warning border border-border">(TEST)</span>
          </div>
        </header>

        {/* MAIN VIEW: PARQUES LIST OR DASHBOARD */}
        {activeTab === 'parques' && !parqueSeleccionado ? (
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
        ) : (
          <>
            {/* DASHBOARD DE PARQUE SELECCIONADO */}
            <Dashboard paneles={paneles} />

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
              <PanelesList
                paneles={paneles}
                parqueSeleccionado={parqueSeleccionado}
                parques={parques}
                inspeccionActiva={inspeccionActiva}
                onLimpiarFiltro={limpiarFiltroParque}
                onRegistrarHallazgo={handleRegistrarHallazgo}
                onSeleccionarPanel={setPanelSeleccionado}
              />
            )}
          </>
        )}


      </div>
    </div>
  )
}

export default App