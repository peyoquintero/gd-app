import React, { useState,useEffect } from "react";
import IntegerMatrix from "./Matrix"
import Table from "./Table";
import {duplicates} from "./helpers"

const Ayuda = (props) => {
   
       const [gridDups,setGridDups] = useState([]);
       const [dups,setDups] = useState({filtroDups:false,filtroMuertos:false});
       const [gridMuertes,setGridMuertes] = useState([]);

       useEffect(()=>{
        let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
        setGridDups(duplicates(allPesajes)) ;
        let muertes = allPesajes.filter(w=>w.Lote.toUpperCase()==='MUERTO');
        setGridMuertes(muertes);
      },[]);

      const columnsMuertes = [
        { label: "Codigo", accessor: "Codigo",width:"30%" },
        { label: "Fecha", accessor: "Fecha",width:"40%" },
        { label: "Marca", accessor: "Marca",width:"30%" },
       ];

      const handleCheckboxChange = (event) => {
        const { name } = event.target;
        setDups({
          ...dups,
          [name]: event.target.checked,
        });
      };

    return (
        <div  >
            <section>
                <label>Version 1.03</label>
            </section>
            <section className="title">
                <label>Codigos Duplicados
                <input style={{paddingTop:'100px'}} type="checkbox" id="checkboxDup" name= "filtroDups" onChange={handleCheckboxChange} />
                </label>
            </section>
            <section>
               {dups?.filtroDups ? <IntegerMatrix nColumns={5} integers={gridDups}></IntegerMatrix> : null}
            </section>
            <section className="title">
                <label>Muertes
                <input style={{paddingTop:'100px'}} type="checkbox" id="checkboxMuertes" name= "filtroMuertos" onChange={handleCheckboxChange} />
                </label>
            </section>
            <section>
               {dups?.filtroMuertos ?  <Table data={gridMuertes} columns={columnsMuertes}></Table> : null}
            </section>
        </div>
    )            
}

export default Ayuda;
