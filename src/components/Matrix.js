import React, { useState, useEffect } from "react";
import  Table  from "./Table";

const IntegerMatrix = ({ integers, nColumns }) => {
const rows = [];
const [gridData, setGridData] = useState([]);

  for (let i = 0; i < integers.length; i += nColumns) {
    const row = integers.slice(i, i + nColumns);
    rows.push(
      <tr key={i}>
        {row.map((integer) => (
          <td key={integer.Codigo} onClick={() => setGridData(integer.pesajes)} style={{ backgroundColor: 'rgb(173, 195, 218)' }}>{integer.Codigo}</td>
        ))}
      </tr>
    );
  }

  useEffect(()=>{
    setGridData(integers[0]?.pesajes);
  },[]);

  const columns = [
    { label: "Codigo", accessor: "Codigo" },  { label: "Fecha", accessor: "Fecha" },  { label: "Peso", accessor: "Peso" },
    { label: "Marca", accessor: "Marca" },    { label: "Lote", accessor: "Lote"},     { label: "Operacion", accessor: "Operacion" },
   ];

  return (
    <div>
    <section >
    <table >        
      <tbody>
        {rows}
       </tbody>
    </table>
    </section>
    <section>
    {gridData.length>0 ?       
      <Table
      data={gridData}
      columns={columns}>
      </Table>
   : null}
    </section>
    </div>
  )
};

export default IntegerMatrix;