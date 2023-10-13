import React, { useState, useEffect } from "react";
import Table from "./Table"
import {cleanData, captionCabezas,captionGanancia,captionMedia,captionUltPeso,captionDias,  ganancias, validLoteOptions} from "./Helpers"
const Ganancias = () => {
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

   const initializeData = (allPesajes) => {
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

      useEffect(()=>{
        let allPesajes =  JSON.parse(localStorage.getItem("spreadsheetData"));
        initializeData(allPesajes)
      },[]);
       
      const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFiltros({
          ...filtros,
          [name]: value,
        });
     };

    const handleFilterLoteChange = (event) => {
        const { name, value } = event.target;
        setFiltros({
          ...filtros,
          [name]: value,
        });
        if (value!=="*" && value.trim()!=="")
            {
            let allFechas = [...new Set(hisPesajes.filter(w=>w.Lote===value.trim()).map(obj => obj.Fecha))];
            setFechasPesaje(allFechas);
          }
          else{
            let allFechas = [...new Set(hisPesajes.map(obj => obj.Fecha))];
            setFechasPesaje(allFechas);
          }
      };

   const handleFilterMarcaChange = (event) => {
      const { name, value } = event.target;
      setFiltros({
        ...filtros,
        [name]: value,
      });
      if (value!=="*" && value.trim()!=="")
      {
      let allFechas = [...new Set(hisPesajes.filter(w=>w.Marca===value.trim()).map(obj => obj.Fecha))];
      setFechasPesaje(allFechas);
    }
    else{
      let allFechas = [...new Set(hisPesajes.map(obj => obj.Fecha))];
      setFechasPesaje(allFechas);
    }
    };

    const handleCheckboxChange = (event) => {
        const { name } = event.target;
        setFiltros({
          ...filtros,
          [name]: event.target.checked,
        });
      };

      const applyFilters = (event) => {

        let hispesajesFiltered = hisPesajes.filter(pesaje=>pesaje.Operacion.toUpperCase() !== 'MUERTE'); 
        if (filtros.filtroMarca!=="*" && filtros.filtroMarca!=="") 
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Marca===filtros.filtroMarca.trim()); 
        }

        if (filtros.filtroCodigo!=="")
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Codigo.startsWith(filtros.filtroCodigo.trim())); 
        }

        if (filtros.filtroLote!=="*" && filtros.filtroLote!=="")
        {
          hispesajesFiltered = hispesajesFiltered.filter(pesaje=>pesaje.Lote===filtros.filtroLote.trim()) 
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

      const columns = [
        { label: "Codigo", accessor: "Codigo",width:"15%" },
        { label: "Fecha Inicial", accessor: "FechaInicial",width:"20%" },
        { label: "Fecha Final", accessor: "FechaFinal",width:"20%" },
        { label: "Peso Inicial", accessor: "PesoInicial",width:"15%" },
        { label: "Peso Final", accessor: "PesoFinal",width:"15%" },
        { label: "Ganancia", accessor: "Ganancia",width:"15%" },
       ];

    return (
      
  <div className="container">
      <section>
      <section>
        <label>Codigo
          <input style={{display:'block'}}  className="freeinput" name="filtroCodigo" placeholder="Codigo" onChange={handleFilterChange}/>
        </label>
        <label>Marca 
          <input style={{display:'block'}} id="marca" className="freeinputsmall" name="filtroMarca" 
          onChange={handleFilterMarcaChange} value={filtros.filtroMarca}/>
        </label>
        <label>Rango Peso 
          <input style={{display:'block'}} id="pesoI" className="freeinput" name="filtroPeso" onChange={handleFilterChange}/>
        </label>
        <label>Lote
        <select style={{display:'block', width:'80px', height:'25px'}} className="freeinput" name="filtroLote" 
                        onChange={handleFilterLoteChange} value={filtros.filtroLote}>
          {lotes.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
        </section>
        <section>
        <label style={{marginLeft:'5px'}}>Fecha Inicial
          <select style={{display:'block', width:'100px', height:'25px'}} className="freeinput" name="fechaInicial" onChange={handleFilterChange}>
          {fechasPesaje.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)}
          </select>
        </label>
        <label className="center-label" style={{fontSize: '14px'}}>=
          <input style={{marginTop:'2px'}} type="checkbox" id="checkbox1" name="fiExacta" onChange={handleCheckboxChange}/>
        </label>
        <label>Fecha Final
          <select style={{display:'block', width:'100px', height:'25px'}} className="freeinput" name="fechaFinal" onChange={handleFilterChange} value={filtros.fechaFinal}>
            {fechasPesaje.map(val => <option key={val} style={{background:"lightgrey"}} value={val}>{val}</option>)} 
          </select>
        </label>
        <label className="center-label" style={{fontSize: '14px'}}>=
          <input style={{marginTop:'2px'}} type="checkbox" id="checkbox2" name="ffExacta" onChange={handleCheckboxChange}/>
        </label>
        <label className="center-label" >Ventas 
          <input  style={{marginTop:'2px'}} type="checkbox" id="checkbox3" name="filtroVentas" onChange={handleFilterChange}/>
        </label>
        
        </section>
        <button style={{ marginLeft: '5px'}} onClick={applyFilters}>Ok</button>
      </section>      
      <section className="totals">
      <label >{captions.resultCabezas}</label> 
      <label>{captions.resultGanancia}</label> 
      <label>{captions.resultMedia}</label>   
      <label>{captions.resultUltPeso}</label>
      <label>{captions.resultDias}</label> 
      </section>
      
        <Table data={gridData} columns={columns}></Table>
      
      </div>
    
    );
  };
  
  export default Ganancias;