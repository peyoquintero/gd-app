import React, { useState, useEffect } from "react";
import  Table  from "./Table";
import {dobleCompraoVenta} from "./HelperInventario"

const Duplicados = () => {
const [gridData, setGridData] = useState([]);

  useEffect(()=>{
    let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
    setGridData(dobleCompraoVenta(allPesajes));
  },[]);

  const columns = [
    { label: "Codigo", accessor: "Codigo" },  
    { label: "Operacion", accessor: "Operacion" },
   ];

  return (
    <div>
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

export default Duplicados;