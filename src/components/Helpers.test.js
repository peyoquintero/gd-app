import {ganancias} from './Helpers';

test('ganancias: vacio', () => {
  //
  let result = ganancias([],'2023-1-1',true,'2023-10-10',true,false);
  expect(result).toEqual([]);
});


test('ganancias: promedio valido', () => {
  //
  let result = ganancias([
    {Codigo:'10B',Fecha:'2023-1-1',Operacion:'Compra'},
    {Codigo:'10B',Fecha:'2023-1-1',Operacion:'Venta'},
    {"Codigo":w.Codigo,
"FechaInicial":w.pi.Fecha,
"FechaFinal":w.pf.Fecha,
"PesoInicial":w.pi.Peso,
"PesoFinal":w.pf.Peso,
"Ganancia": gananciaDiaria(w.pi,w.pf),
"Dias":20}
],'2023-1-1',true,'2023-10-10',true,false);
  expect(result).toEqual([]);
});

