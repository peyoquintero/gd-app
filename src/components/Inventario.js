import React, { useState, useEffect } from "react";
import Table from "./Table";

const Inventario = () => {
  const columns = [
    { label: "Fecha", accessor: "Fecha",width:"25%" },
    { label: "Operacion", accessor: "Operacion",width:"25%" },
    { label: "Marca", accessor: "Marca",width:"20%" },
    { label: "Total", accessor: "Total",width:"15%" },
    { label: "Vendidos", accessor: "Vendidos",width:"15%" },
   ];


   const [selectedOption, setSelectedOption] = useState("movimientos");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

   const [gridData,setGridData] = useState([])
   const [gridInventario,setGridInventario] = useState([])

   const columnsInventario = [
    { label: "Codigo", accessor: "Codigo",width:"20%" },
    { label: "Marca", accessor: "Marca",width:"10%" },
    { label: "Fecha Compra", accessor: "FechaCompra",width:"20%" },
    { label: "Peso Inicial", accessor: "PesoInicial",width:"10%" },
    { label: "Ultimo Control", accessor: "FechaUltimoControl",width:"20%" },
    { label: "Ultimo Peso", accessor: "PesoFinal",width:"10%" },
   ];

   function getInventario(data) {
    data.sort((a, b) => a.Codigo.localeCompare(b.Codigo));
    data.sort(function(a,b){return new Date(a.Fecha) - new Date(b.Fecha); })
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.Codigo}`;
      if (!acc[key]) {
        acc[key] = {
          Codigo: item.Codigo,
          Marca: item.Marca,
          Pesajes: [],
        };
      }
      acc[key].Pesajes.push(item)
      return acc;
    }, {});

    var result = Object.values(groupedData);

    let codigosVendidos = data.filter(w=>['VENTA','MUERTE'].includes(w?.Operacion?.toUpperCase())).map(x=>x.Codigo);
    result = result.filter(x => !codigosVendidos.includes(x.Codigo));

    result = result.map(w=> {return {
      Codigo: w.Codigo,
      Marca: w.Marca,
      FechaCompra: w.Pesajes[0]?.Fecha,      
      PesoInicial: w.Pesajes[0]?.Peso,
      FechaUltimoControl: w.Pesajes[w.Pesajes.length-1]?.Fecha,
      PesoFinal: w.Pesajes[w.Pesajes.length-1]?.Peso
                           }});
    return result;
  }

   function intersectCount (comprados,vendidos){
    return comprados.filter(w=>vendidos.includes(w)).length;
   }

   function groupByFechaOperacion(data) {
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.Fecha}-${item.Operacion}-${item.Marca}`;
      if (!acc[key]) {
        acc[key] = {
          Fecha: item.Fecha,
          Operacion: item.Operacion,
          Marca: item.Marca,
          Total: 0,
          Codigos: [],
          Vendidos: 0
        };
      }
      acc[key].Total++;
      acc[key].Codigos.push(item.Codigo)
      return acc;
    }, {});

    var result = Object.values(groupedData);
    let codigosVendidos = data.filter(w=>w?.Operacion?.toUpperCase()==='VENTA').map(x=>x.Codigo);

    result = result.map(w=>{w.Vendidos= w?.Operacion?.toUpperCase()!=='COMPRA'? 0 : intersectCount(w.Codigos??[],codigosVendidos??[]);
                            return w;    
                           });
    return result;
  }

   useEffect(()=>{
    let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
    let movimientos =  allPesajes.filter(w=>w.Operacion.toUpperCase() !== "CONTROL")
                                 .sort(function(a,b){ return new Date(a.Fecha) - new Date(b.Fecha);});
    if (movimientos?.length)                             
    {let movimientosByFecha = groupByFechaOperacion(movimientos);
    setGridData(movimientosByFecha); 
    setGridInventario(getInventario(allPesajes));
    }
  },[]);

  return (
    <>
    <div>
    <section  >
    <div className="radio-container" onChange={handleChange}>
      <input type="radio" name="details" value="movimientos" checked={selectedOption === "movimientos"} />Movimientos
      <input type="radio" name="details" value="cabezas" checked={selectedOption === "cabezas"} /> Inventario Actual
      <span>{selectedOption === "movimientos" ? "" : `Total: ${gridInventario.length}`}</span>
    </div>
    
    </section>
  
    <section>
    {selectedOption === "movimientos" ?  
    <div className="container">
      <Table
        data={gridData}
        columns={columns}></Table>
    </div> :
    <div className="container">
    <Table
      data={gridInventario}
      columns={columnsInventario}></Table>
  </div>}    
    </section>
    </div>
  </>

  );
}

export default Inventario;