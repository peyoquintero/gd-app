import { getPesajesByCodigo } from './HelperInventario'
export const matchCodigo = (w,filterKey)=>{
       return (filterKey.includes("*") && String(w).toLowerCase().startsWith(filterKey.toLowerCase().replace("*", ""))) || 
       ((!filterKey.includes("*") && String(w).toLowerCase().indexOf(filterKey.toLowerCase()) > -1)) };

export const filteredGData = (filteredData,filterKeyValue,excludeColumn,filtroExacto) => {
  let filterKey = filterKeyValue && filterKeyValue.toLowerCase().trim()
  if (filterKey && !filterKey.includes("^")) {
      filteredData = filteredData.filter((row) => {
      return Object.keys(row).filter(w=>w!==excludeColumn).some((key) => {
        if(!filterKey.includes(";"))
            return ((!filtroExacto && matchCodigo(row[key],filterKey)) 
                      || (filtroExacto && String(row[key]).toLowerCase()===filterKey))  
        else
        {
          if(filterKey.includes(";"))
          { 
            let fkeys = filterKey.split(";").filter(w=>w!=='');
            return fkeys.some(element =>  matchCodigo(row[key],element));
         }
       }
    })
  })}

  const containsAll = (array1, array2) => array2.every((element) => array1.includes(element.toLowerCase()));

  if (filterKey&&filterKey.includes("^")) {
       let fkeys = filterKey.split("^").filter(w=>w!=='');
       filteredData = filteredData.filter((row) => { 
       return containsAll(Object.values(row).map(w=>w.toLowerCase()),fkeys); 
      })        
   }

  return filteredData;
}

const median = (arr) =>  {
  const mid = Math.floor(arr.length / 2),
  nums = [...arr].sort((a, b) => a - b);
return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

const daysBetweenDates = (fechaInicial,fechaFinal) =>
{
  let fi = new Date(fechaInicial);
  let ff = new Date(fechaFinal);
  let diffTime = Math.abs(ff - fi);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays>0?diffDays:0;    
}

export const cleanData= (gridData,min,max) =>
{
return gridData.filter(w=>(w.Ganancia>min && w.Ganancia<max && w.PesoInicial>0 && w.PesoFinal>0)) ;
}

export const  captionCabezas = (cleanDataCount,gridDataCount) =>
{ var cabezas = cleanDataCount>0 ? ` Cabezas: ${gridDataCount}`: `No hay datos disponibles`;
return cabezas;
}

export const captionGanancia = (data) =>
{
let totalDias = data.reduce((ac,a) => daysBetweenDates(a.FechaInicial,a.FechaFinal) + ac,0);
let avgGd = Math.round(data.reduce((ac,a) => (a.Ganancia*daysBetweenDates(a.FechaInicial,a.FechaFinal)) + ac,0)/totalDias);
var ganancia = data.length>0 ? `Ganancia(grs):  ${avgGd}`:"";
return ganancia;
}

export const captionMedia = (data) =>
{ let media =  median(data.map(function(element){return element.Ganancia}));
var mediana = data.length>0 ? `Media: ${media??""} `: "";
return mediana;
}
export const captionDias = (data) =>
{ let avgDias = Math.round(data.reduce((ac,a) => a.Dias + ac,0)/data.length);
var dias = data.length>0 ? `Dias:  ${avgDias}`: "";
return dias;
}
export const captionUltPeso= (data) =>
{ let promUltPeso = median(data.map(function(element){return element.PesoFinal}));
let labelPromUltPeso = promUltPeso>500? '' : `Prom. Ultimo Peso:  ${promUltPeso}`
var ultpeso = data.length>0 ? `${labelPromUltPeso}`: ""; 
return ultpeso;
}
export const validLoteOptions= (lotes) =>
{
lotes.push('*');
return lotes.filter(w=>(w!=='NULL'))
}

export const mapApiDataToPesajes= (apiResult) => {
  const rows = [];
  const rawRows = apiResult.values || [];
  const headers = rawRows.shift();
    rawRows.forEach((row) => {
    const rowData = {};
    row.forEach((item, index) => {
    rowData[headers[index]] = item;
  });
  rows.push(rowData);
  });
  return rows;
}

export const resurrect = (pesajes) =>
{
let result = Object.values(getPesajesByCodigo(pesajes));
let dups = result.filter(w=>{ let ultimo= w.pesajes && w.pesajes[w.pesajes.length-1];
                              return (ultimo && ['VENTA','MUERTE','CORRECCION'].includes (ultimo.Operacion?.toUpperCase()) && w.pesajes && w.pesajes.some(x=>['VENTA','MUERTE','CORRECCION'].includes (x.Operacion?.toUpperCase())))});  
return dups;
}

const gananciaDiaria = (pesoInicial,pesoFinal) =>
{
  return Math.round((pesoFinal.Peso-pesoInicial.Peso)/ ((new Date(pesoFinal.Fecha)-new Date(pesoInicial.Fecha))/86400000)*1000)
}

const  gananciaDiariaPesajes = (results, fechaInicial, fechaFinal, fiExacta, ffExacta, filtroVentas) =>
{
  var minmaxPesajes = [];
  results.forEach(result => {
    let datafilter=result.pesajes;
    datafilter=datafilter.filter(w => w.Fecha>=fechaInicial&&w.Fecha<=fechaFinal);
    let minP=datafilter[0];
    let maxP=datafilter[datafilter.length-1];
    if(fiExacta) {
      minP=datafilter.find(w => w.Fecha===fechaInicial);
    }
    if(ffExacta) {
      maxP=datafilter.find(w => w.Fecha===fechaFinal);
    }
    if(filtroVentas) {
      maxP=datafilter.find(w => w.Operacion.toLowerCase()==="venta"&&(!ffExacta||w.Fecha===fechaFinal));
    }

    let minMaxPesajes=[minP, maxP];
    let objresult={ Codigo: result.Codigo, pi: minMaxPesajes[0], pf: minMaxPesajes[1] };
    if((minP!==undefined)&&(maxP!==undefined)&&(maxP.Fecha>minP.Fecha)) { minmaxPesajes.push(objresult); };
  });
  return minmaxPesajes;
}


export const ganancias = (hispesajes,fechaInicial,fiExacta,fechaFinal,ffExacta,filtroVentas) =>
{
    var results = hispesajes.reduce(function(h, obj) {
      h[obj.Codigo] = (h[obj.Codigo] || []).concat(obj);
      return h; 
    }, {});

    results = Object.keys(results).map(key => {
              return {
                Codigo: key, 
                pesajes : hispesajes.filter(pesaje=>pesaje.Codigo===key)
                                    .sort(function(a,b){
                                            return new Date(a.Fecha) - new Date(b.Fecha);
                                          })}
              }
            );

    results = results.filter(result=>result.pesajes.length>1) // Excluir semovientes con un solo pesaje

    let minmaxPesajes = gananciaDiariaPesajes(results, fechaInicial, fechaFinal, fiExacta, ffExacta, filtroVentas);

    var datos = minmaxPesajes.map(w=> {return {"Codigo":w.Codigo,
    "FechaInicial":w.pi.Fecha,
    "FechaFinal":w.pf.Fecha,
    "PesoInicial":w.pi.Peso,
    "PesoFinal":w.pf.Peso,
    "Ganancia": gananciaDiaria(w.pi,w.pf),
    "Dias": Math.round((new Date(w.pf.Fecha)-new Date(w.pi.Fecha))/86400000)
    }});

    return datos
}

export const compareNumAlphas = (str1, str2) =>
 {
    // Check if either string starts with numbers.
    const regex = /^\d+/;
    const match1 = str1?.toString().match(regex);
    const match2 = str2?.toString().match(regex);
  
    if (!match1 && !match2) {
      return str1?.toString().localeCompare(str2);
    }
  
    if (match1 && match2) {
      const num1 = parseInt(match1);
      const num2 = parseInt(match2);
      return (num1 === num2) ? str1?.toString().localeCompare(str2) :  (num1 < num2 ? -1 : 1);
    }
  
    // If only one string starts with numbers, return that string first.
    return match1 ? -1 : 1;
  }  
