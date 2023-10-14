import React, { useState,useEffect } from "react";
import IntegerMatrix from "./Matrix"
import Table from "./Table";
import {duplicates} from "./Helpers"
import  Codigos  from "./Codigos";

const Ayuda = (props) => {
   
    const [filtros,setFiltros] = useState({filtroDups:false,filtroMuertos:false});
    const [gridDups,setGridDups] = useState([]);
    const [gridMuertes,setGridMuertes] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const lastRefresh =  localStorage.getItem("lastRefresh");

    const handleChange = (event) => {
      setSelectedOption(event.target.value);
    };

    const handleCheckboxChange = (event) => {
      const { name } = event.target;
      setFiltros({
        ...filtros,
        [name]: event.target.checked,
      });
    };

   useEffect(()=>{
    let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
    if (allPesajes?.length)
    {
      setGridDups(duplicates(allPesajes)) ;
      let muertes = allPesajes.filter(w=>w.Operacion.toUpperCase().trim()==='MUERTE')
                    .sort(function(a,b){return new Date(a.Fecha) - new Date(b.Fecha);})
      setGridMuertes(muertes);
    }
    },[]);

   const columnsMuertes = [
    { label: "Codigo", accessor: "Codigo", width:"30%" },
    { label: "Fecha", accessor: "Fecha", width:"40%" },
    { label: "Marca", accessor: "Marca", width:"30%" }
    ];

    return (
        <div >
            <section className="radio-container" onChange={handleChange}>
              <input type="radio" name="details1" value="optionInconsistencias" checked={selectedOption === "optionInconsistencias"} />Inconsistencias
              <input type="radio" name="details2" value="optionRevisionCodigos" checked={selectedOption === "optionRevisionCodigos"} /> Revision Codigos
            </section>
            <section style={{background:'rgb(249, 249, 249)'}}>
               {((selectedOption === "optionInconsistencias") && gridDups?.length>0 ) ? <IntegerMatrix nColumns={5} integers={gridDups}></IntegerMatrix> : null}
               {(selectedOption === "optionRevisionCodigos")?  <Codigos/> : null}
            </section>
            <section className="title" >
                <label className="ayudaLabel" >Muertes
                <input  type="checkbox" id="checkboxMuertes" name= "filtroMuertos" onChange={handleCheckboxChange} />
                </label>
            </section>
            <section>
               {filtros?.filtroMuertos ? 
                <Table data={gridMuertes} columns={columnsMuertes}></Table> :
                 null}
            </section>
            <section >
                <label style={{ fontSize:'12px', color:'GrayText'}} >Version 1.1.1 - {lastRefresh}</label>
            </section>
        </div>
    )            
}

export default Ayuda;
