export const getPesajesByCodigo = (data)=>{
    const sorted = [...data].sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    return sorted.reduce((acc, item) => {
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

export const getInventarioV2 = (data, fechaProyeccion, gananciaDiaria, smartGDP) => {
  if (!smartGDP) {
    // When not smart, still include the Gdia (gr/día) and days column for display consistency
    const base = getInventario(data, fechaProyeccion, gananciaDiaria);
    const gdiaGrs = Number(gananciaDiaria) > 0 ? Number(gananciaDiaria) : 350;
    return base.map(it => ({ ...it, Gdia: Math.round(gdiaGrs), GdiaDias: '' }));
  }

  const groupedData = getPesajesByCodigo(data);
  let result = Object.values(groupedData);
  result = result.filter(w => w.Pesajes[0].Operacion?.toUpperCase() === 'COMPRA');
  let codigosVendidos = data.filter(w => ['VENTA', 'MUERTE', 'CORRECCION'].includes(w?.Operacion?.toUpperCase())).map(x => x.Codigo);
  result = result.filter(x => !codigosVendidos.includes(x.Codigo));
  
  const defaultGDP = gananciaDiaria > 0 ? gananciaDiaria / 1000 : 350 / 1000;

  result = result.map(w => {
    const ultimoPesaje = w.Pesajes[w.Pesajes.length - 1];
    let gd = defaultGDP;
    let gdDias = '';

    if (w.Pesajes.length >= 2 && ultimoPesaje?.Peso > 320) {
      const penultimoPesaje = w.Pesajes[w.Pesajes.length - 2];
      const fecha1 = new Date(penultimoPesaje.Fecha);
      const fecha2 = new Date(ultimoPesaje.Fecha);
      const diasDiferencia = Math.ceil((fecha2 - fecha1) / (60000 * 60 * 24));
      if (diasDiferencia > 21) {
        const customGDP = (Number(ultimoPesaje.Peso) - Number(penultimoPesaje.Peso)) / diasDiferencia;
        if (customGDP > 0) {
          gd = customGDP;
          gdDias = diasDiferencia;
        }
      }
    }

    return {
      Codigo: w.Codigo,
      Marca: w.Marca,
      Chapeta: w.Chapeta,
      FechaCompra: w.Pesajes[0]?.Fecha,
      PesoInicial: w.Pesajes[0]?.Peso,
      FechaUltimoControl: ultimoPesaje?.Fecha,
      PesoFinal: ultimoPesaje?.Peso,
      Gdia: Math.round(gd * 1000),      // gr/día usados
      GdiaDias: gdDias,                 // días entre pesajes usados para Gdia
      Proyeccion: getProyeccion(
        ultimoPesaje?.Fecha,
        ultimoPesaje?.Peso,
        fechaProyeccion || Date.now(),
        gd
      )
    };
  });
  return result;
}

export const getInventario = (data, fechaProyeccion,gananciaDiaria ) => {
  const groupedData = getPesajesByCodigo(data)
  let result = Object.values(groupedData);
  result = result.filter(w=>w.Pesajes[0].Operacion?.toUpperCase()==='COMPRA'); 
  let codigosVendidos = data.filter(w=>['VENTA','MUERTE','CORRECCION'].includes(w?.Operacion?.toUpperCase())).map(x=>x.Codigo);
  result = result.filter(x => !codigosVendidos.includes(x.Codigo));
  let gd = gananciaDiaria > 0 ? gananciaDiaria/1000 : 350/1000
  result = result.map(w=> {return {
    Codigo: w.Codigo,
    Marca: w.Marca,
    Chapeta: w.Chapeta,
    FechaCompra: w.Pesajes[0]?.Fecha,      
    PesoInicial: w.Pesajes[0]?.Peso,
    FechaUltimoControl: w.Pesajes[w.Pesajes.length-1]?.Fecha,
    PesoFinal: w.Pesajes[w.Pesajes.length-1]?.Peso,
    // Use provided projection date; fallback to now if missing
    Proyeccion: getProyeccion(
      w.Pesajes[w.Pesajes.length-1]?.Fecha,
      w.Pesajes[w.Pesajes.length-1]?.Peso,
      fechaProyeccion || Date.now(),
      gd  
    )
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
    let codigosVendidos = data.filter(w=>['VENTA','MUERTE','CORRECCION'].includes(w?.Operacion?.toUpperCase())).map(x=>x.Codigo);

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
    return filteredData.map((group) => {return {Codigo: group[0].Codigo,Operacion: group[0].Operacion,Marcas:group[0].Marca+','+group[1].Marca}})
  
    }

