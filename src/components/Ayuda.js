import React, { useState,useEffect } from "react";
import IntegerMatrix from "./Matrix"
import {duplicates} from "./helpers"

const Ayuda = (props) => {
   
       const [gridData,setGridData] = useState([]);
       const [dups,setDups] = useState(false);

       useEffect(()=>{
        let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));

        setGridData(duplicates(allPesajes)) //.map(w=>w.Codigo)

      },[]);

      const handleCheckboxChange = (event) => { setDups(event.target.checked); };

    return (
        <div  >
            <section>
                <label>Version 1.01</label>
            </section>
            <section className="title">
                <label>Codigos Duplicados
                <input style={{paddingTop:'100px'}} type="checkbox" id="checkboxDup" name= "filtroDup" onChange={handleCheckboxChange} />
                </label>
            </section>
            <section>
               {dups ? <IntegerMatrix nColumns={5} integers={gridData}></IntegerMatrix> : null}
            </section>
        </div>
    )            
}

export default Ayuda;
