import React from "react";

const Table = ({ data, columns, onSort, sortConfig }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No hay datos para mostrar</div>;
  }

  const getSortIndicator = (columnAccessor) => {
    if (!sortConfig || sortConfig.key !== columnAccessor) {
      return null; // No indicator
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th 
              key={col.accessor} 
              style={{ width: col.width, cursor: 'pointer' }}
              onClick={() => onSort(col.accessor)} // Tell the parent to sort
            >
              {col.label}
              {getSortIndicator(col.accessor)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={row.id ?? index}>
            {columns.map((col) => (
              <td key={col.accessor}>{row[col.accessor]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;

