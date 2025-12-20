import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { InspeccionForm } from './InspeccionForm'
import { Dashboard } from './Dashboard' // <--- 1. IMPORTAR

function App() {
  const [paneles, setPaneles] = useState([])
  const [panelSeleccionado, setPanelSeleccionado] = useState(null)

  useEffect(() => {
    getPaneles()
  }, [panelSeleccionado])

  async function getPaneles() {
    const { data, error } = await supabase
      .from('paneles')
      .select('*')
      .order('id', { ascending: true })

    if (error) console.log('Error:', error)
    else setPaneles(data)
  }

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'CRITICO': return '#ff4d4f';
      case 'ALERTA': return '#faad14';
      case 'OPERATIVO': return '#52c41a';
      default: return '#d9d9d9';
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0', background: '#f0f2f5', minHeight: '100vh', justifyContent: 'center' }}>

      <h1 style={{ textAlign: 'center', color: '#001529' }}>⚡ SolarCondicional Manager</h1>

      {/* 2. AGREGAR EL DASHBOARD AQUÍ */}
      {/* Solo lo mostramos si NO estamos inspeccionando un panel, para no distraer */}
      {!panelSeleccionado && <Dashboard paneles={paneles} />}

      {panelSeleccionado ? (
        <InspeccionForm
          panelId={panelSeleccionado}
          onCerrar={() => setPanelSeleccionado(null)}
        />
      ) : (
        <div>
          <h2 style={{ marginLeft: '10px', color: 'black' }}>Inventario de Paneles</h2>
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {paneles.map((panel) => (
              <div
                key={panel.id}
                onClick={() => setPanelSeleccionado(panel.id)}
                style={{
                  padding: '15px',
                  borderLeft: `6px solid ${getColorEstado(panel.ultimo_estado)}`, // Borde de color lindo
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'black',
                  background: 'white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Etiqueta pequeña de estado */}
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#eee',
                    fontWeight: 'bold'
                  }}>
                    #{panel.id}
                  </span>

                  <div>
                    <strong style={{ display: 'block' }}>{panel.codigo_serie}</strong>
                    <span style={{ fontSize: '0.85em', color: '#888' }}>{panel.modelo}</span>
                  </div>
                </div>

                <button style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                  border: 'none',
                  background: '#1890ff',
                  color: 'white',
                  borderRadius: '4px'
                }}>
                  {panel.ultimo_estado === 'PENDIENTE' ? 'Inspeccionar' : 'Ver / Editar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App