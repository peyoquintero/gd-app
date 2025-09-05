import React from 'react';

const RevisionCodigos = ({ matches, onSort, sortConfig }) => {
  if (!matches || matches.length === 0) {
    return <p>No se encontraron coincidencias potenciales.</p>;
  }

  // --- START: CALCULATE STATS ---
  const totalCount = matches.length;
  let medianDiff = 0;

  // Extract and sort the percentage differences numerically
  const diffPercentages = matches
    .map(match => parseFloat(match.DiffPercent))
    .filter(num => !isNaN(num)) // Ensure we only have numbers
    .sort((a, b) => a - b);

  if (diffPercentages.length > 0) {
    const midIndex = Math.floor(diffPercentages.length / 2);
    if (diffPercentages.length % 2 === 0) {
      // Even number of items: average the two middle ones
      medianDiff = (diffPercentages[midIndex - 1] + diffPercentages[midIndex]) / 2;
    } else {
      // Odd number of items: pick the middle one
      medianDiff = diffPercentages[midIndex];
    }
  }
  // --- END: CALCULATE STATS ---

  const getSortIndicator = (key) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const headers = [
    { key: 'Codigo', label: 'Código' },
    { key: 'Marca', label: 'Marca' },
    { key: 'FechaCompra', label: 'F. Compra' },
    { key: 'PesoCompra', label: 'Peso Compra' },
    { key: 'FechaUltimoControl', label: 'F. Últ. Control' },
    { key: 'PesoUltimoControl', label: 'Últ. Peso' },
    { key: 'FechaVentaPotencial', label: 'F. Venta Potencial' },
    { key: 'PesoVentaPotencial', label: 'Peso Venta' },
    { key: 'PesoProyectado', label: 'Peso Proyectado' },
    { key: 'GDP', label: 'GDP (kg/día)' },
    { key: 'DiffPercent', label: 'Dif. (%)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>
        <span>Total Coincidencias: {totalCount}</span>
        <span style={{ marginLeft: '20px' }}>Mediana de Diferencia: {medianDiff.toFixed(1)}%</span>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header.key} onClick={() => onSort(header.key)} style={{ cursor: 'pointer' }}>
                  {header.label}
                  {getSortIndicator(header.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr key={index}>
                {headers.map(header => (
                  <td key={header.key}>{match[header.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevisionCodigos;