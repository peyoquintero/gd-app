export const filteredGData = (filteredData,filterKeyValue,excludeColumn,filtroExacto) => {
  let filterKey = filterKeyValue && filterKeyValue.toLowerCase()

  const matchCodigo = (w,filterKey)=>{return (filterKey.includes("*") && String(w).toLowerCase().startsWith(filterKey.toLowerCase())) || String(w).toLowerCase().indexOf(filterKey.toLowerCase()) > -1 };
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


export const cleanData= (gridData) =>
{
return gridData.filter(w=>(w.Ganancia>-1000 && w.Ganancia<2000 && w.PesoInicial>0 && w.PesoFinal>0)) ;
}

export const  captionCabezas = (cleanDataCount,gridDataCount) =>
{ var cabezas = cleanDataCount>0 ? ` Cabezas: ${gridDataCount}`: `No hay datos disponibles`;
return cabezas;
}

export const captionGanancia = (cleanData) =>
{
let totalDias = cleanData.reduce((ac,a) => daysBetweenDates(a.FechaInicial,a.FechaFinal) + ac,0);
let avgGd = Math.round(cleanData.reduce((ac,a) => (a.Ganancia*daysBetweenDates(a.FechaInicial,a.FechaFinal)) + ac,0)/totalDias);
var ganancia = cleanData.length>0 ? `Ganancia(grs):  ${avgGd}`:"";
return ganancia;
}

export const captionMedia = (cleanData) =>
{ let media =  median(cleanData.map(function(element){return element.Ganancia}));
var mediana = cleanData.length>0 ? `Media: ${media??""} `: "";
return mediana;
}
export const captionDias = (cleanData) =>
{ let avgDias = Math.round(cleanData.reduce((ac,a) => a.Dias + ac,0)/cleanData.length);
var dias = cleanData.length>0 ? `Dias:  ${avgDias}`: "";
return dias;
}
export const captionUltPeso= (cleanData) =>
{ let promUltPeso = median(cleanData.map(function(element){return element.PesoFinal}));
let labelPromUltPeso = promUltPeso>500? '' : `Prom. Ultimo Peso:  ${promUltPeso}`
var ultpeso = cleanData.length>0 ? `${labelPromUltPeso}`: ""; 
return ultpeso;
}
export const validLoteOptions= (lotes) =>
{
lotes.push('*');
return lotes.filter(w=>(w!=='NULL'))
}

export const transform= (apiResult) => {
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

export const duplicates = (pesajes) =>
{
let result = pesajesByCodigo(pesajes);
let dups = result.filter(w=>{ let ultimo=w.pesajes[w.pesajes.length-1];
                              return (ultimo.Operacion.toLowerCase()!=='venta' && w.pesajes && w.pesajes.some(x=>x.Operacion.toLowerCase()==='venta'))});  
return dups;
}


const reduceCodigos = (hispesajes,lote) =>
{
return hispesajes.filter(w=>w.Lote.toUpperCase()===lote).reduce(function(h, obj) {
  h[obj.Codigo] = (h[obj.Codigo] || []).concat(obj);
  return h; 
  }, {});
}
// AKA master
export const pesajesByCodigo = (hispesajes) =>
{

let resultsBov = reduceCodigos(hispesajes,'BOVINOS')
let resultsBuf = reduceCodigos(hispesajes,'BUFALOS')

let results = Object.keys(resultsBov).map(key => {
  return {
      Codigo: key, 
      pesajes : hispesajes.filter(pesaje=>pesaje.Codigo===key && pesaje.Lote.toUpperCase()==='BOVINOS').sort(function(a,b){
                return new Date(a.Fecha) - new Date(b.Fecha);})}
  }).concat(Object.keys(resultsBuf).map(key => {
    return {
        Codigo: key, 
        pesajes : hispesajes.filter(pesaje=>pesaje.Codigo===key  && pesaje.Lote.toUpperCase()==='BUFALOS').sort(function(a,b){
                  return new Date(a.Fecha) - new Date(b.Fecha);})}
    })) ;


return results
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
      pesajes : hispesajes.filter(pesaje=>pesaje.Codigo===key).sort(function(a,b){
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


