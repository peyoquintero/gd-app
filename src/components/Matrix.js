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
          <td key={integer.Codigo} onClick={() => setOpen({isOpen:true,gridData:integer.pesajes})}>{integer.Codigo}</td>
        ))}
      </tr>
    );
  }
  const columns = [
    { label: "Codigo", accessor: "Codigo",width:"15%" },
    { label: "Fecha", accessor: "Fecha",width:"20%" },
    { label: "Peso", accessor: "Peso",width:"15%" },
    { label: "Marca", accessor: "Marca",width:"15%" },
    { label: "Lote", accessor: "Lote",width:"15%" },
    { label: "Operacion", accessor: "Operacion",width:"20%" },
   ];

   let details = open.gridData.length ?       <Table
   data={open.gridData}
   columns={columns}>
   </Table>
: null;

  return (
    <div className="container">
    <section>
    <table>
      <thead>
        <tr>
          {Array.from({ length: nColumns }, (_, i) => (
            <th key={i}>Col {i + 1}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
    </section>
    <section>
      {details}
        </section>
    </div>

  )
};

export default IntegerMatrix;