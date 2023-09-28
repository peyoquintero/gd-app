import React, { useState, useEffect } from "react";
import IntegerMatrix from "./Matrix"
import {duplicates} from "./helpers"

const Ayuda = (props) => {
   
       const [gridData,setGridData] = useState([]);

       useEffect(()=>{
        let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));

        setGridData(duplicates(allPesajes)) //.map(w=>w.Codigo)

      },[]);

    return (
        <div  >
            <section>
                <label>Version 1.0</label>
            </section>
            <section className="title">
                <label>Codigos Duplicados</label>
            </section>
            <section>
                <IntegerMatrix nColumns={5} integers={gridData}></IntegerMatrix>
            </section>
        </div>
    )            
}

export default Ayuda;
