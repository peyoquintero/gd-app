import React, { useState, useEffect } from "react";
import {cleanData, captionCabezas,captionGanancia,captionMedia,captionUltPeso,captionDias,  ganancias, transform,validLoteOptions} from "./helpers"
import axios from "axios";
const Ganancias = (props) => {
    const [filters, setFilters] = useState({
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
      const [lotes,setLotes] = useState([])
      const [fechasPesaje,setFechasPesaje] = useState([])

      let scrubbedData = [];
      let resultCabezas = ''
//      let fechasPesaje = [];
      let resultGanancia = "";
      let resultMedia = "";
      let resultUltPeso = "";
      let resultDias = "";

      const url = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8";

      useEffect(()=>{
        axios.get(url)
        .then((response)=>{
          setGridData(response.data);
          let hispesajes = transform(response.data)
          setFechasPesaje([...new Set( hispesajes.map(obj => obj.Fecha)) ]);
          setLotes(validLoteOptions([...new Set( hispesajes.map(obj => obj.Lote))]));
          setFilters({
            ...filters,
            fechaInicial: fechasPesaje[0] ?? new Date('2020-01-01T00:00:00'),
            fechaFinal : fechasPesaje[fechasPesaje.length-1] ?? new Date()
          });
  
        }
        )
      },[]);
    
      const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters({
          ...filters,
          [name]: value,
        });
      };

      const applyFilters = (event) => {
        scrubbedData = cleanData(gridData); 

        let hisPesajes = transform(gridData)
        let hispesajesFiltered = hisPesajes.filter(pesaje=>pesaje.Lote !== 'MUERTO'); 
        if (filters.filtroMarca!=="*" && filters.filtroMarca!=="") 
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Marca===filters.filtroMarca); 
        }
        if (filters.filtroCodigo!=="")
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Codigo.startsWith(filters.filtroCodigo)); 
        }

        let gridDataResults = ganancias(hispesajesFiltered,filters.fechaInicial,filters.fiExacta,filters.fechaFinal,filters.ffExacta,filters.filtroVentas);

        if (filters.filtroPeso!=="*" && filters.filtroPeso.trim()!=="") 
        {
          const array=filters.filtroPeso.split("-");
          if (array.length===2)
          { 
            gridDataResults = gridDataResults.filter(pesaje=>parseInt(pesaje.PesoInicial)>=parseInt(array[0]) && parseInt(pesaje.PesoInicial)<=parseInt(array[1]));
          } 
        }    

        resultGanancia = captionGanancia(gridDataResults);
        resultCabezas = captionCabezas(scrubbedData.length,gridData.length)
        resultUltPeso = captionUltPeso(gridDataResults);
        resultDias = captionDias(gridDataResults);
        resultMedia = captionMedia(gridDataResults);

        setGridData(gridDataResults);  

      }

    return (
      <React.Fragment>
      <section>
        <label>Codigo
          <input style={{display:'block'}}  className="freeinput" name="filtroCodigo" placeholder="Codigo"/>
        </label>
        <label>Marca 
          <input style={{display:'block'}} id="marca" className="freeinputsmall" name="filtroMarca"/>
        </label>
        <label>Rango Peso 
          <input style={{display:'block'}} id="pesoI" className="freeinput" name="filtroPeso"/>
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
            <input style={{marginTop:'25px'}} type="checkbox" id="checkbox1" name="fiExacta" onChange={handleFilterChange}/>
            <label style={{marginTop:'30px'}}>=</label>
        <label>Fecha Final
        <select style={{display:'block', width:'120px', height:'30px'}} name="fechaFinal" onChange={handleFilterChange}>
          {fechasPesaje.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
          <input style={{marginTop:'25px'}} type="checkbox" id="checkbox2" name="ffExacta" onChange={handleFilterChange}/>
          <label style={{marginTop:'25px'}}>=</label>
        <label>Solo Ventas
          <input style={{marginTop:'25px'}} type="checkbox" id="checkbox3" name="filtroVentas" onChange={handleFilterChange}/>
        </label>
        <button onClick={applyFilters}>Ok</button>
      </section>      
      <section className="totals">
      <span >{resultCabezas} </span> 
      <span>{resultGanancia}</span> 
      <span>{resultMedia}</span>   
      <span>{resultUltPeso}</span>
      <span>{resultDias}</span> 
      </section>
    </React.Fragment>
    );
  };
  
  export default Ganancias;