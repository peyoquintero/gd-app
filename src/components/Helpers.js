import { getPesajesByCodigo } from './HelperInventario'

export const matchCodigo = (w,filterKey)=>{
       return (filterKey.includes("*") && String(w).toLowerCase().startsWith(filterKey.toLowerCase().replace("*", ""))) || 
       ((!filterKey.includes("*") && String(w).toLowerCase().indexOf(filterKey.toLowerCase()) > -1)) };

export const filteredGData = (filteredData,filterKeyValue,excludeColumn,filtroExacto) => {
  let filterKey = filterKeyValue && filterKeyValue.toLowerCase().trim()
  if (filterKey && !filterKey.includes("^")) {
      filteredData = filteredData.filter((row) => {
      return Object.keys(row).filter(w=>w!==excludeColumn).some((key) => {
        // --- START: FIX ---
        // Simplified logic to ensure a value is always returned.
        if(!filterKey.includes(";")) {
            return ((!filtroExacto && matchCodigo(row[key],filterKey)) 
                      || (filtroExacto && String(row[key]).toLowerCase()===filterKey));
        }
        else {
            let fkeys = filterKey.split(";").filter(w=>w!=='');
            return fkeys.some(element =>  matchCodigo(row[key],element));
        }
        // --- END: FIX ---
    })
  })}

  const containsAll = (array1, array2) => array2.every((element) => array1.includes(element.toLowerCase()));

  if (filterKey&&filterKey.includes("^")) {
       let fkeys = filterKey.split("^").filter(w=>w!=='');
       filteredData = filteredData.filter((row) => { 
       return containsAll(Object.values(row).map(w=>String(w ?? '').toLowerCase()),fkeys);
      })        
   }

  return filteredData;
}

const median = (arr) => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].map(Number).sort((a, b) => a - b);
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

export const parseCleanDataRange = (raw) => {
  const defaults = { min: -200, shortMax: 1800, longMax: 1000 };
  const parts = (raw || '-0200/1800/1000').split('/').map(val => parseInt(val.trim(), 10));
  const min      = isNaN(parts[0]) ? defaults.min      : parts[0];
  const shortMax = isNaN(parts[1]) ? defaults.shortMax : parts[1];
  const longMax  = parts.length >= 3 ? (isNaN(parts[2]) ? defaults.longMax : parts[2]) : shortMax;
  return { min, shortMax, longMax };
};

const DAYS_THRESHOLD = 90;

export const cleanData = (gridData, min, shortMax, longMax) => {
  return gridData.filter(w => {
    const max = w.Dias <= DAYS_THRESHOLD ? shortMax : longMax;
    return w.Ganancia > min && w.Ganancia < max && w.PesoInicial > 0 && w.PesoFinal > 0;
  });
};

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
{ let promUltPeso = Math.round(data.reduce((ac,a) => a.PesoFinal + ac,0)/data.length);
let labelPromUltPeso = promUltPeso>500? '' : `Prom. Ultimo Peso:  ${promUltPeso}`
var ultpeso = data.length>0 ? `${labelPromUltPeso}`: ""; 
return ultpeso;
}

export const mapApiDataToPesajes= (apiResult) => {
  const rows = [];
  const rawRows = [...(apiResult.values || [])];
  const headers = rawRows.shift();
    rawRows.forEach((row) => {
    const rowData = {};
    row.forEach((item, index) => {
    rowData[headers[index]] = item?.trim()?.toUpperCase();
  });
  rows.push(rowData);
  });
  return rows;
}

export const resurrect = (rows) => {
  const grouped = getPesajesByCodigo(rows) || {};
  const TERMINALS = new Set(['VENTA', 'MUERTE', 'CORRECCION']);
  const out = [];

  Object.values(grouped).forEach(g => {
    const arr = g.Pesajes || g.pesajes || [];
    if (!Array.isArray(arr) || arr.length === 0) return;

    // --- Existing Resurrection Logic ---
    const ops = arr.map(p => (p?.Operacion || '').toUpperCase().trim());
    const terminalIdxs = ops
      .map((op, idx) => (TERMINALS.has(op) ? idx : -1))
      .filter(idx => idx >= 0);

    const lastIdx = arr.length - 1;

    const singleTerminalOnly = arr.length === 1 && terminalIdxs.length === 1;
    const multipleTerminals = terminalIdxs.length >= 2;
    const terminalBeforeLast = terminalIdxs.some(idx => idx < lastIdx);

    // --- START: New Marca Mismatch Logic ---
    let marcaMismatch = false;
    const compraPesaje = arr.find(p => (p?.Operacion || '').toUpperCase().trim() === 'COMPRA');

    if (compraPesaje && compraPesaje.Marca) {
      const compraMarca = compraPesaje.Marca.toUpperCase().trim();
      
      // Find any VENTA or MUERTE operations that occurred on or after the compra date
      const exitPesajes = arr.filter(p => {
        const op = (p?.Operacion || '').toUpperCase().trim();
        return (op === 'VENTA' || op === 'MUERTE') && new Date(p.Fecha) >= new Date(compraPesaje.Fecha);
      });

      // Check if any of these exit operations have a different Marca
      if (exitPesajes.length > 0) {
        marcaMismatch = exitPesajes.some(exitPesaje => {
          const exitMarca = exitPesaje.Marca?.toUpperCase().trim();
          // A mismatch occurs if the exitMarca exists and is different from the compraMarca
          return exitMarca && exitMarca !== compraMarca;
        });
      }
    }
    // --- END: New Marca Mismatch Logic ---

    // --- START: New CORRECCION without COMPRA logic ---
    let correctionWithoutCompra = false;
    const hasCorrection = ops.includes('CORRECCION');
    const hasCompra = ops.includes('COMPRA');

    if (hasCorrection && !hasCompra) {
        correctionWithoutCompra = true;
    }
    // --- END: New CORRECCION without COMPRA logic ---

    // Include the Codigo if it meets any of the integrity check conditions
    if (singleTerminalOnly || multipleTerminals || terminalBeforeLast || marcaMismatch || correctionWithoutCompra) {
      out.push({ Codigo: g.Codigo, pesajes: arr });
    }
  });

  return out;
};

// --- START: REFACTORED MATCHING FUNCTION ---
export const findPotentialMatches = (allPesajes, dailyGain = 0.350, tolerance = 0.30, forceDailyGain = false) => {
  if (!allPesajes || allPesajes.length === 0) return [];

  // 1. Data Preparation
  const pesajesByCodigo = getPesajesByCodigo(allPesajes);
  
  // Assign a unique ID to each unidentified sale to track them
  const unidentifiedSales = allPesajes
    .filter(p => p.Operacion?.toUpperCase() === 'VENTA' && p.Codigo?.includes('?'))
    .map((sale, index) => ({ ...sale, saleId: `sale_${index}` }))
    .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

  const correctionCodigos = Object.values(pesajesByCodigo).filter(group => 
    group.Pesajes.some(p => p.Operacion?.toUpperCase() === 'CORRECCION')
  );

  let allPotentialMatches = [];

  // 2. Generate ALL possible matches within the tolerance
  for (const animalGroup of correctionCodigos) {
    const pesajes = animalGroup.Pesajes.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    
    const compra = pesajes.find(p => p.Operacion?.toUpperCase() === 'COMPRA');
    if (!compra) continue;

    const lastControl = [...pesajes].reverse().find(p => p.Operacion?.toUpperCase() === 'CONTROL');
    const baseline = lastControl || compra;
    const baselineDate = new Date(baseline.Fecha);
    const baselineWeight = parseInt(baseline.Peso, 10);

    let animalSpecificDailyGain = dailyGain;
    if (lastControl && !forceDailyGain) {
      const compraDate = new Date(compra.Fecha);
      const compraWeight = parseInt(compra.Peso, 10);
      const lastControlDate = new Date(lastControl.Fecha);
      const lastControlWeight = parseInt(lastControl.Peso, 10);
      if (lastControlDate > compraDate) {
        const daysBetween = (lastControlDate - compraDate) / (1000 * 60 * 60 * 24);
        if (daysBetween > 0) {
          animalSpecificDailyGain = (lastControlWeight - compraWeight) / daysBetween;
        }
      }
    }

    for (const sale of unidentifiedSales) {
      const saleDate = new Date(sale.Fecha);
      const saleWeight = parseInt(sale.Peso, 10);

      if (saleDate > baselineDate) {
        const daysDiff = (saleDate - baselineDate) / (1000 * 60 * 60 * 24);
        const projectedWeight = baselineWeight + (daysDiff * animalSpecificDailyGain);
        
        const weightDifference = Math.abs(projectedWeight - saleWeight);
        const percentageDiff = saleWeight > 0 ? (weightDifference / saleWeight) : 0;
        
        if (percentageDiff <= tolerance) {
          allPotentialMatches.push({
            Codigo: animalGroup.Codigo,
            Marca: compra.Marca,
            FechaCompra: compra.Fecha,
            PesoCompra: compra.Peso,
            FechaUltimoControl: baseline.Fecha,
            PesoUltimoControl: baseline.Peso,
            FechaVentaPotencial: sale.Fecha,
            PesoVentaPotencial: sale.Peso,
            PesoProyectado: Math.round(projectedWeight),
            GDP: animalSpecificDailyGain.toFixed(3),
            DiffPercent: (percentageDiff * 100), // Store as number for sorting
            saleId: sale.saleId // Keep track of which sale this is
          });
        }
      }
    }
  }

  // 3. Select the best one-to-one matches
  // Sort all possibilities by the smallest percentage difference
  allPotentialMatches.sort((a, b) => a.DiffPercent - b.DiffPercent);

  const finalMatches = [];
  const usedAnimalCodigos = new Set();
  const usedSaleIds = new Set();

  for (const match of allPotentialMatches) {
    // If both the animal and the sale are not yet claimed, this is a valid one-to-one match
    if (!usedAnimalCodigos.has(match.Codigo) && !usedSaleIds.has(match.saleId)) {
      finalMatches.push({
        ...match,
        DiffPercent: match.DiffPercent.toFixed(1) + '%' // Format for display
      });
      // Mark both as used for future iterations
      usedAnimalCodigos.add(match.Codigo);
      usedSaleIds.add(match.saleId);
    }
  }

  return finalMatches;
};
// --- END: REFACTORED MATCHING FUNCTION ---


const gananciaDiaria = (pesoInicial,pesoFinal) =>
{
  return Math.round((pesoFinal.Peso-pesoInicial.Peso)/ ((new Date(pesoFinal.Fecha)-new Date(pesoInicial.Fecha))/86400000)*1000)
}

export const ganancias = (hispesajes, fechaInicial, fiComparator, fechaFinal, ffComparator, filtroVentas) =>
{
    if (!hispesajes || hispesajes.length === 0) {
        return [];
    }

    // 1. Group all weigh-ins by animal code
    var groupedByCodigo = hispesajes.reduce(function(h, obj) {
      h[obj.Codigo] = (h[obj.Codigo] || []).concat(obj);
      return h; 
    }, {});

    // 2. Create a clean array of animals, each with their weigh-ins sorted by date
    let results = Object.keys(groupedByCodigo).map(key => {
        return {
            Codigo: key, 
            pesajes : groupedByCodigo[key].sort((a,b) => new Date(a.Fecha) - new Date(b.Fecha))
        }
    }).filter(result => result.pesajes.length > 1); // Exclude animals with only one weigh-in or dead/corrected

    // 3. Filter animals based on the new date criteria
    const fiDate = new Date(fechaInicial);
    fiDate.setUTCHours(0, 0, 0, 0);
    const ffDate = new Date(fechaFinal);
    ffDate.setUTCHours(0, 0, 0, 0);

    const checkDateCondition = (dateStr, comparator, referenceDate) => {
      const pDate = new Date(dateStr);
      if (isNaN(pDate.getTime())) return false;
      pDate.setUTCHours(0, 0, 0, 0);

      switch (comparator) {
        case '>=': return pDate >= referenceDate;
        case '=':  return pDate.getTime() === referenceDate.getTime();
        case '<=': return pDate <= referenceDate;
        default:   return true;
      }
    };

    const filteredAnimals = results.filter(animal => {
      // An animal is included if ANY of its weigh-ins match the start OR end conditions.
      const hasStartMatch = animal.pesajes.some(p => checkDateCondition(p.Fecha, fiComparator, fiDate));
      const hasEndMatch = animal.pesajes.some(p => checkDateCondition(p.Fecha, ffComparator, ffDate));
      return hasStartMatch || hasEndMatch;
    });

    // 4. For the filtered animals, find their initial and final weigh-ins for calculation
    const minmaxPesajes = [];
    filteredAnimals.forEach(animal => {
        let minP = null;
        let maxP = null;
        
        // Find the index of the first weigh-in that meets the start condition.
        const startIndex = animal.pesajes.findIndex(p => checkDateCondition(p.Fecha, fiComparator, fiDate));
        // Find the index of the LAST weigh-in that meets the end condition.
        const endIndex = animal.pesajes.findLastIndex(p => checkDateCondition(p.Fecha, ffComparator, ffDate));

        // If valid start and end points are found, slice the array to get the relevant range.
        const relevantPesajes = (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex)
            ? animal.pesajes.slice(startIndex, endIndex + 1)
            : [];

        // With this filter, only ventas and compras are used for calculations
        if (filtroVentas) {
            const venta = relevantPesajes.slice().reverse().find(w => w.Operacion?.toUpperCase() === "VENTA");
            if (venta) {
                maxP = venta;
                const compra = relevantPesajes.filter(w => w.Operacion?.toUpperCase() === "COMPRA" && new Date(w.Fecha) <= new Date(maxP.Fecha)).pop();
                if (compra) minP = compra;
            }
        } 
        else {
            const primerPesajeRelevante = relevantPesajes.find(p => p.Operacion?.toUpperCase() === 'COMPRA' || p.Operacion?.toUpperCase() === 'CONTROL');
            minP = primerPesajeRelevante; 

            const ventas = relevantPesajes.filter(p => p.Operacion?.toUpperCase() === 'VENTA');
            if (ventas.length > 0) {
                maxP = ventas[ventas.length - 1]; // Last sale in the relevant history
            } else {
                // If no sale, use the last control weigh-in from the relevant pesajes
                const controls = relevantPesajes.filter(p => p.Operacion?.toUpperCase() === 'CONTROL');
                if (controls.length > 0) { // Last control
                    maxP = controls[controls.length - 1];
                }
            }
        }

        if (minP && maxP && new Date(maxP.Fecha) > new Date(minP.Fecha)) {
            minmaxPesajes.push({ Codigo: animal.Codigo, pi: minP, pf: maxP });
        }
    });

    // 5. Map the final data to the grid format
    const formatDate = (dateStr) => {
      if (!dateStr) return dateStr;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toISOString().split('T')[0];
    };

    var datos = minmaxPesajes.map(w=> {return {"Codigo":w.Codigo,
        "Chapeta":w.pi.Chapeta,
        "Marca":w.pi.Marca, // <-- THIS IS THE FIX
        "FechaInicial":formatDate(w.pi.Fecha),
        "FechaFinal":formatDate(w.pf.Fecha),
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
    const regex = /^-?\d+/; 
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
