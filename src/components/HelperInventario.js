export const getPesajesByCodigo = (data)=>{
    data.sort((a, b) => a.Codigo.localeCompare(b.Codigo));
    data.sort(function(a,b){return new Date(a.Fecha) - new Date(b.Fecha); })
    return data.reduce((acc, item) => {
        const key = `${item.Codigo}`;
        if (!acc[key]) {
          acc[key] = {
            Codigo: item.Codigo,
            Marca: item.Marca,
            Chapeta: item.Chapeta,            
            Pesajes: [],
          };
        }
        acc[key].Pesajes.push(item)
        return acc;
      }, {});
}

const getProyeccion = (fechaUltimoPeso,ultimoPeso,fechaProyeccion,gananciaDiaria) => {
  if (!fechaUltimoPeso || !ultimoPeso || !fechaProyeccion || !gananciaDiaria) {
    return 0;
  }
  const fechaUltimo = new Date(fechaUltimoPeso);
  const fechaProy = new Date(fechaProyeccion);
  const diasDiferencia = Math.ceil((fechaProy - fechaUltimo) / (60000 * 60 * 24));
  const pry = Number(ultimoPeso) + (diasDiferencia * Number(gananciaDiaria));
  return pry.toFixed(0);

}

export const getInventario = (data) => {
    const groupedData = getPesajesByCodigo(data)
    let result = Object.values(groupedData);
    result = result.filter(w=>w.Pesajes[0].Operacion?.toUpperCase()==='COMPRA'); 
    let codigosVendidos = data.filter(w=>['VENTA','MUERTE','CORRECCION'].includes(w?.Operacion?.toUpperCase())).map(x=>x.Codigo);
    result = result.filter(x => !codigosVendidos.includes(x.Codigo));

    result = result.map(w=> {return {
      Codigo: w.Codigo,
      Marca: w.Marca,
      Chapeta: w.Chapeta,
      FechaCompra: w.Pesajes[0]?.Fecha,      
      PesoInicial: w.Pesajes[0]?.Peso,
      FechaUltimoControl: w.Pesajes[w.Pesajes.length-1]?.Fecha,
      PesoFinal: w.Pesajes[w.Pesajes.length-1]?.Peso,
      Proyeccion: getProyeccion(w.Pesajes[w.Pesajes.length-1]?.Fecha,
                                w.Pesajes[w.Pesajes.length-1]?.Peso,
                                Date.now(),350/1000) // Assuming 0.35 as the daily gain
                           }});
    return result;
  }

  
  function intersectCount (comprados,vendidos){
    return comprados.filter(w=>vendidos.includes(w)).length;
   }

  export const groupByFechaOperacion = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.Fecha}-${item.Operacion}-${item.Marca}`;
      if (!acc[key]) {
        acc[key] = {
          Fecha: item.Fecha,
          Operacion: item.Operacion,
          Chapeta: item.Chapeta,
          Marca: item.Marca,
          Total: 0,
          Codigos: [],
          Vendidos: 0
        };
      }
      acc[key].Total++;
      acc[key].Codigos.push(item.Codigo)
      return acc;
    }, {});

    var result = Object.values(groupedData);
    let codigosVendidos = data.filter(w=>w?.Operacion?.toUpperCase()==='VENTA').map(x=>x.Codigo);

    result = result.map(w=>{w.Vendidos= w?.Operacion?.toUpperCase()!=='COMPRA'? 0 : intersectCount(w.Codigos??[],codigosVendidos??[]);
                            return w;    
                           });
    return result;
  }

  export const dobleCompraoVenta = (data) => 
  {
    data = data.filter(w=>['VENTA','COMPRA'].includes(w.Operacion?.toUpperCase()))
    const groupedData = data.reduce((acc, obj) => {
      const key = [obj.Codigo.toUpperCase(), obj.Operacion.toUpperCase()];
      acc[key] = acc[key] || [];
      acc[key].push(obj);
      return acc;
    }, {});
    
    const filteredData = Object.values(groupedData).filter((group) => group.length > 1);
    console.log(filteredData)
    return filteredData.map((group) => {return {Codigo: group[0].Codigo,Operacion: group[0].Operacion}})
  
    }
  
