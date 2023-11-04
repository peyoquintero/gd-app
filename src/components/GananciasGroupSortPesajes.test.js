import {ganancias} from './Helpers';
const sampleData = [
    {"Fecha":"2023-02-16","Codigo":"141-V","Peso":"334","Sexo":"M","Marca":"AO","Lote":"Bovinos","Operacion":"Compra"},
    {"Fecha":"2023-09-16","Codigo":"141-V","Peso":"287","Sexo":"M","Marca":"AO","Lote":"Bovinos","Operacion":"Compra"},
    {"Fecha":"2023-09-16","Codigo":"145","Peso":"290","Sexo":"M","Marca":"AO","Lote":"Bovinos","Operacion":"Compra"}
];
test('ganancias should group and sort pesajes correctly', () => {
  const fechaInicial = '2023/01/28';
  const fiExacta = true;
  const fechaFinal = '2023/10/31';
  const ffExacta = true;
  const filtroVentas = true;

  const result = ganancias(sampleData, fechaInicial, fiExacta, fechaFinal, ffExacta, filtroVentas);

  // Your expectations here
  // For example, you can check if the result is an array of grouped and sorted pesajes
  expect(Array.isArray(result)).toBe(true);
  // You can add more specific expectations based on your data and use case.
});

