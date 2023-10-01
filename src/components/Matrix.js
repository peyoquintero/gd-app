import React, { useState } from "react";
import  Table  from "./Table";

const IntegerMatrix = ({ integers, nColumns }) => {
  const rows = [];
  const [open, setOpen] = useState({isOpen:false,gridData:[]});

  for (let i = 0; i < integers.length; i += nColumns) {
    const row = integers.slice(i, i + nColumns);
    rows.push(
      <tr key={i}>
        {row.map((integer) => (
          <td key={integer.Codigo} onClick={() => setOpen({isOpen:true,gridData:integer.pesajes})} style={{ backgroundColor: 'rgb(173, 195, 218)' }}>{integer.Codigo}</td>
        ))}
      </tr>
    );
  }

  const columns = [
    { label: "Codigo", accessor: "Codigo" },
    { label: "Fecha", accessor: "Fecha" },
    { label: "Peso", accessor: "Peso" },
    { label: "Marca", accessor: "Marca" },
    { label: "Lote", accessor: "Lote"},
    { label: "Operacion", accessor: "Operacion" },
   ];

   let details = open.gridData.length>0 ?       
   <Table
   data={open.gridData}
   columns={columns}>
   </Table>
: null;

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
      {details}
    </section>
    </div>

  )
};

export default IntegerMatrix;