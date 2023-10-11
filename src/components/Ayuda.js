import React, { useState,useEffect } from "react";
import IntegerMatrix from "./Matrix"
import Table from "./Table";
import {duplicates} from "./Helpers"
import  Codigos  from "./Codigos";

const Ayuda = (props) => {
   
    const [filtros,setFiltros] = useState({filtroDups:false,filtroMuertos:false});
    const [gridDups,setGridDups] = useState([]);
    const [gridMuertes,setGridMuertes] = useState([]);

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
        { label: "Codigo", accessor: "Codigo",width:"30%" },
        { label: "Fecha", accessor: "Fecha",width:"40%" },
        { label: "Marca", accessor: "Marca",width:"30%" },
       ];

      const handleCheckboxChange = (event) => {
        const { name } = event.target;
        setFiltros({
          ...filtros,
          [name]: event.target.checked,
        });
      };

    return (
        <div >
            <section className="title">
                <label className="ayudaLabel" >Inconsistencias
                    <input  type="checkbox" id="checkboxDup" name= "filtroDups" onChange={handleCheckboxChange} />
                </label>
            </section>
            <section style={{background:'rgb(249, 249, 249)'}}>
               {(filtros?.filtroDups &&gridDups?.length>0 ) ? <IntegerMatrix nColumns={5} integers={gridDups}></IntegerMatrix> : null}
            </section>
            <section className="title">
                <label className="ayudaLabel" >Codigos -  Revision
                    <input  type="checkbox" id="checkboxCodigos" name= "filtroCodigos" onChange={handleCheckboxChange} />
                </label>
            </section>
            <section>
            {filtros?.filtroCodigos ? 
              <Codigos/> :
              null}
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
                <label style={{ fontSize:'12px', color:'GrayText'}} >Version 1.08</label>
            </section>
        </div>
    )            
}

export default Ayuda;
