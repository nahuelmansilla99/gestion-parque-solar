import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { InspeccionForm } from './InspeccionForm' // <--- Importamos el componente nuevo

function App() {
  const [paneles, setPaneles] = useState([])
  const [panelSeleccionado, setPanelSeleccionado] = useState(null) // Para saber cuál estamos editando

  useEffect(() => {
    getPaneles()
  }, [])

  async function getPaneles() {
    const { data, error } = await supabase
      .from('paneles')
      .select('*')
      .order('id', { ascending: true }) // Ordenar para que no bailen

    if (error) console.log('Error:', error)
    else setPaneles(data)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚡ SolarCondicional Manager</h1>

      {/* Si hay un panel seleccionado, mostramos el formulario. Si no, la lista */}
      {panelSeleccionado ? (
        <InspeccionForm
          panelId={panelSeleccionado}
          onCerrar={() => setPanelSeleccionado(null)}
        />
      ) : (
        <div>
          <h2>Selecciona un panel para inspeccionar:</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {paneles.map((panel) => (
              <div
                key={panel.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'white',
                  color: '#333'
                }}
                onClick={() => setPanelSeleccionado(panel.id)}
              >
                <strong>{panel.codigo_serie}</strong>
                <span>{panel.modelo}</span>
                <button>Inspeccionar 📝</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App