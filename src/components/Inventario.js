import React, { useState, useEffect } from "react";
import Table from "./Table";

const Inventario = () => {
  const columns = [
    { label: "Fecha", accessor: "Fecha",width:"30%" },
    { label: "Operacion", accessor: "Operacion",width:"30%" },
    { label: "Marca", accessor: "Marca",width:"30%" },
    { label: "Total", accessor: "Total",width:"10%" },
   ];

   const [gridData,setGridData] = useState([])

   function groupByFechaOperacion(data) {
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.Fecha}-${item.Operacion}-${item.Marca}`;
      if (!acc[key]) {
        acc[key] = {
          Fecha: item.Fecha,
          Operacion: item.Operacion,
          Marca: item.Marca,
          Total: 0,
        };
      }
      acc[key].Total++;
      return acc;
    }, {});
  
    // Return the grouped data.
    return Object.values(groupedData);
  }

   useEffect(()=>{
    let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
    let movimientos =  allPesajes.filter(w=>w.Operacion.toUpperCase() !== "CONTROL")
                                 .sort(function(a,b){ return new Date(a.Fecha) - new Date(b.Fecha);});
    let movimientosByFecha = groupByFechaOperacion(movimientos);
    setGridData(movimientosByFecha); 
  },[]);

  return (
    <div className="container">
      <Table
        data={gridData}
        columns={columns}></Table>
    </div>
  );
}

export default Inventario;