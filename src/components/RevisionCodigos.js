import React from 'react';

const RevisionCodigos = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return <p>No se encontraron coincidencias potenciales.</p>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Marca</th>
            <th>F. Compra</th>
            <th>F. Últ. Control</th>
            <th>Últ. Peso</th>
            <th>F. Venta Potencial</th>
            <th>Peso Venta</th>
            <th>Peso Proyectado</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td>{match.Codigo}</td>
              <td>{match.Marca}</td>
              <td>{match.FechaCompra}</td>
              <td>{match.FechaUltimoControl}</td>
              <td>{match.PesoUltimoControl}</td>
              <td>{match.FechaVentaPotencial}</td>
              <td>{match.PesoVentaPotencial}</td>
              <td>{match.PesoProyectado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RevisionCodigos;