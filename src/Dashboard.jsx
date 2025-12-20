import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard({ paneles }) {

    // 1. Calcular estadísticas en tiempo real
    const data = [
        { name: 'Críticos', value: 0, color: '#ff4d4f' }, // Rojo
        { name: 'Alerta', value: 0, color: '#faad14' },   // Amarillo
        { name: 'Operativos', value: 0, color: '#52c41a' },// Verde
        { name: 'Pendientes', value: 0, color: '#d9d9d9' } // Gris
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

    return (
        <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap'
        }}>

            {/* SECCIÓN DE TEXTO / KPIs */}
            <div style={{ minWidth: '200px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Resumen del Parque</h2>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#333' }}>
                    {totalPaneles} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Paneles Totales</span>
                </div>

                {/* Alerta de Acción Rápida */}
                {data[0].value > 0 && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: '#fff1f0',
                        border: '1px solid #ffccc7',
                        borderRadius: '6px',
                        color: '#cf1322'
                    }}>
                        ⚠️ <strong>{data[0].value} Paneles Críticos</strong> requieren atención inmediata.
                    </div>
                )}
            </div>

            {/* SECCIÓN DEL GRÁFICO */}
            <div style={{ width: '300px', height: '300px' }}>
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
                        >
                            {dataVisible.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}