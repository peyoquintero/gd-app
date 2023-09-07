import React, { useState, useEffect } from "react";
import TablaGananciasDiarias from "./TablaGananciasDiarias"
import {cleanData, captionCabezas,captionGanancia,captionMedia,captionUltPeso,captionDias,  ganancias, transform,validLoteOptions} from "./helpers"
import axios from "axios";
const Ganancias = (props) => {
    const [filtros, setFiltros] = useState({
        filtroCodigo: "",
        filtroMarca: "",
        filtroPeso: "",
        filtroLote: "",
        fechaInicial:  new Date('2020-01-01T00:00:00'),
        fechaFinal: new Date(),
        fiExacta: false,
        ffExacta: false,
        filtroVentas: false,
      });

      const [gridData,setGridData] = useState([])
      const [hisPesajes,setHispesajes] = useState([])
      const [lotes,setLotes] = useState([])
      const [fechasPesaje,setFechasPesaje] = useState([])

      const [captions,setCaptions] = useState({
         resultCabezas : "",
         resultGanancia : "",
         resultMedia : "",
         resultUltPeso : "",
         resultDias : "",
        })

      const url = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8";

      useEffect(()=>{
        axios.get(url)
        .then((response)=>{
          let allPesajes = transform(response.data); 
          let allFechas = [...new Set(allPesajes.map(obj => obj.Fecha))];
          setHispesajes(allPesajes);
          setFechasPesaje(allFechas);
          setLotes(validLoteOptions([...new Set( allPesajes.map(obj => obj.Lote))]));
          setFiltros({
            fechaInicial: allFechas[0] ?? new Date('2020-01-01T00:00:00'),
            fechaFinal : allFechas[allFechas.length-1] ?? new Date(),
            filtroCodigo: "",
            filtroMarca: "",
            filtroPeso: "",
            filtroLote: "",
            fiExacta: false,
            ffExacta: false,
            filtroVentas: false,
              });
        }
        )
      },[]);
    
      const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFiltros({
          ...filtros,
          [name]: value,
        });
      };

      const handleCheckboxChange = (event) => {
        const { name } = event.target;
        setFiltros({
          ...filtros,
          [name]: event.target.checked,
        });
      };


      const applyFilters = (event) => {

        let hispesajesFiltered = hisPesajes.filter(pesaje=>pesaje.Lote !== 'MUERTO'); 
        if (filtros.filtroMarca!=="*" && filtros.filtroMarca!=="") 
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Marca===filtros.filtroMarca); 
        }
        if (filtros.filtroCodigo!=="")
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Codigo.startsWith(filtros.filtroCodigo)); 
        }
        if (filtros.filtroLote!=="*" && filtros.filtroLote!=="")
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Lote===filtros.filtroLote) 
        }

        let gridDataResults = ganancias(hispesajesFiltered,filtros.fechaInicial,filtros.fiExacta,filtros.fechaFinal,filtros.ffExacta,filtros.filtroVentas);

        gridDataResults = gridDataResults.map((obj,index) => ({ ...obj, id: index }))

        setGridData(gridDataResults);  

        if (filtros.filtroPeso!=="*" && filtros.filtroPeso.trim()!=="") 
        {
          const array=filtros.filtroPeso.split("-");
          if (array.length===2)
          { 
            gridDataResults = gridDataResults.filter(pesaje=>parseInt(pesaje.PesoInicial)>=parseInt(array[0]) && parseInt(pesaje.PesoInicial)<=parseInt(array[1]));
          } 
        }    


        let scrubbedData = cleanData(gridDataResults);
        
        setCaptions({
        resultGanancia : captionGanancia(scrubbedData),
        resultCabezas : captionCabezas(scrubbedData.length,gridDataResults.length),
        resultUltPeso : captionUltPeso(scrubbedData),
        resultDias : captionDias(scrubbedData),
        resultMedia : captionMedia(scrubbedData)
        })

      }

    return (
      <React.Fragment>
      <section>
        <label>Codigo
          <input style={{display:'block'}}  className="freeinput" name="filtroCodigo" placeholder="Codigo" onChange={handleFilterChange}/>
        </label>
        <label>Marca 
          <input style={{display:'block'}} id="marca" className="freeinputsmall" name="filtroMarca" onChange={handleFilterChange}/>
        </label>
        <label>Rango Peso 
          <input style={{display:'block'}} id="pesoI" className="freeinput" name="filtroPeso" onChange={handleFilterChange}/>
        </label>
        <label>Lote
        <select style={{display:'block', width:'120px', height:'30px'}} name="filtroLote" onChange={handleFilterChange}>
          {lotes.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
        <label style={{marginLeft:'30px'}}>Fecha Inicial
          <select style={{display:'block', width:'120px', height:'30px'}} name="fechaInicial" onChange={handleFilterChange}>
          {fechasPesaje.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
            <input style={{marginTop:'25px'}} type="checkbox" id="checkbox1" name="fiExacta" onChange={handleCheckboxChange}/>
            <label style={{marginTop:'30px'}}>=</label>
        <label>Fecha Final
        <select style={{display:'block', width:'120px', height:'30px'}} name="fechaFinal" onChange={handleFilterChange}>
          {fechasPesaje.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
          <input style={{marginTop:'25px'}} type="checkbox" id="checkbox2" name="ffExacta" onChange={handleCheckboxChange}/>
          <label style={{marginTop:'25px',marginLeft:'0px'}}>=</label>
        <label>Solo Ventas
          <input type="checkbox" id="checkbox3" name="filtroVentas" onChange={handleCheckboxChange}/>
        </label>
        <button onClick={applyFilters}>Ok</button>
      </section>      
      <section className="totals">
      <label >{captions.resultCabezas}</label> 
      <label>{captions.resultGanancia}</label> 
      <label>{captions.resultMedia}</label>   
      <label>{captions.resultUltPeso}</label>
      <label>{captions.resultDias}</label> 
      </section>
      <section>
        <TablaGananciasDiarias gridData={gridData}></TablaGananciasDiarias>
      </section>
    </React.Fragment>
    );
  };
  
  export default Ganancias;