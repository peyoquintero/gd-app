import {
  ganancias
} from '../Helpers';

// This is the raw input data, simulating the full history of weigh-ins.
// It's derived from the mockPesajes output data.
const rawPesajesInput = [
  // Data for Codigo "04-E"
  { Codigo: "04-E", Chapeta: "0717-6", Marca: "AG", Fecha: "2025-06-11", Peso: "336", Operacion: "CONTROL" },
  { Codigo: "04-E", Chapeta: "0717-6", Marca: "AG", Fecha: "2025-08-09", Peso: "342", Operacion: "CONTROL" },
  // Data for Codigo "06-E"
  { Codigo: "06-E", Chapeta: "0709-3?", Marca: "AG", Fecha: "2025-06-11", Peso: "326", Operacion: "CONTROL" },
  { Codigo: "06-E", Chapeta: "0709-3?", Marca: "AG", Fecha: "2025-08-09", Peso: "343", Operacion: "CONTROL" },
  // Data for Codigo "05-E"
  { Codigo: "05-E", Chapeta: "0726-7", Marca: "AG", Fecha: "2025-06-11", Peso: "336", Operacion: "CONTROL" },
  { Codigo: "05-E", Chapeta: "0726-7", Marca: "AG", Fecha: "2025-08-09", Peso: "350", Operacion: "CONTROL" },
  // Data for Codigo "33-E"
  { Codigo: "33-E", Chapeta: "0736-6", Marca: "AG", Fecha: "2025-07-11", Peso: "412", Operacion: "CONTROL" },
  { Codigo: "33-E", Chapeta: "0736-6", Marca: "AG", Fecha: "2025-08-09", Peso: "418", Operacion: "CONTROL" },
  // Data for Codigo "24-E"
  { Codigo: "24-E", Chapeta: "0710-1", Marca: "AG", Fecha: "2025-07-11", Peso: "369", Operacion: "CONTROL" },
  { Codigo: "24-E", Chapeta: "0710-1", Marca: "AG", Fecha: "2025-08-09", Peso: "387", Operacion: "CONTROL" },
  // Data for Codigo "31-E"
  { Codigo: "31-E", Chapeta: "0732-5", Marca: "AG", Fecha: "2025-07-11", Peso: "378", Operacion: "CONTROL" },
  { Codigo: "31-E", Chapeta: "0732-5", Marca: "AG", Fecha: "2025-08-09", Peso: "386", Operacion: "CONTROL" },
  // Data for Codigo "13-E"
  { Codigo: "13-E", Chapeta: "8513-8", Marca: "AG", Fecha: "2025-07-11", Peso: "319", Operacion: "CONTROL" },
  { Codigo: "13-E", Chapeta: "8513-8", Marca: "AG", Fecha: "2025-08-09", Peso: "322", Operacion: "CONTROL" },
  // Data for Codigo "18-E"
  { Codigo: "18-E", Chapeta: "0724-2", Marca: "AG", Fecha: "2025-07-11", Peso: "355", Operacion: "CONTROL" },
  { Codigo: "18-E", Chapeta: "0724-2", Marca: "AG", Fecha: "2025-08-09", Peso: "356", Operacion: "CONTROL" },
  // Data for Codigo "15-E"
  { Codigo: "15-E", Chapeta: "0740-8", Marca: "AG", Fecha: "2025-07-11", Peso: "361", Operacion: "CONTROL" },
  { Codigo: "15-E", Chapeta: "0740-8", Marca: "AG", Fecha: "2025-08-09", Peso: "388", Operacion: "CONTROL" },
  // Data for Codigo "28-E"
  { Codigo: "28-E", Chapeta: "0707-4", Marca: "AG", Fecha: "2025-07-11", Peso: "322", Operacion: "CONTROL" },
  { Codigo: "28-E", Chapeta: "0707-4", Marca: "AG", Fecha: "2025-08-09", Peso: "343", Operacion: "CONTROL" },
  // Data for Codigo "36-E"
  { Codigo: "36-E", Chapeta: "0714-3?", Marca: "AG", Fecha: "2025-07-11", Peso: "337", Operacion: "CONTROL" },
  { Codigo: "36-E", Chapeta: "0714-3?", Marca: "AG", Fecha: "2025-08-09", Peso: "338", Operacion: "CONTROL" },
  // Data for Codigo "40-E"
  { Codigo: "40-E", Chapeta: "0734-1", Marca: "AG", Fecha: "2025-07-11", Peso: "396", Operacion: "CONTROL" },
  { Codigo: "40-E", Chapeta: "0734-1", Marca: "AG", Fecha: "2025-08-09", Peso: "399", Operacion: "CONTROL" },
  // Data for Codigo "16-E"
  { Codigo: "16-E", Chapeta: "0720-0", Marca: "AG", Fecha: "2025-07-11", Peso: "351", Operacion: "CONTROL" },
  { Codigo: "16-E", Chapeta: "0720-0", Marca: "AG", Fecha: "2025-08-09", Peso: "367", Operacion: "CONTROL" },
];

describe('ganancias helper function', () => {

  // Test case 1: Calculate gains for a specific date range
  test('should correctly calculate gains for animals weighed between two dates', () => {
    const fechaInicial = '2025-06-11';
    const fechaFinal = '2025-08-09';
    const results = ganancias(rawPesajesInput, fechaInicial, '>=', fechaFinal, '<=', false);

    // There are 13 animals in the mock data
    expect(results.length).toBe(13);

    // Check a specific animal's calculation ("06-E")
    const animal06E = results.find(r => r.Codigo === '06-E');
    expect(animal06E.PesoInicial).toBe("326");
    expect(animal06E.PesoFinal).toBe("343");
    expect(animal06E.Ganancia).toBe(586); // (343 - 326) / 29 days * 1000g
  });

  // Test case 2: Calculate the average daily gain across all animals
  test('should correctly calculate the average daily gain (Media G/D)', () => {
    const fechaInicial = '2025-06-11';
    const fechaFinal = '2025-08-09';
    const results = ganancias(rawPesajesInput, fechaInicial, '>=', fechaFinal, '<=', false);

    // Calculate the expected average from the mock data
    const sumOfDailyGains = results.reduce((acc, cur) => acc + cur.Ganancia, 0);
    const expectedAverage = Math.round(sumOfDailyGains / results.length);

    // The mock data has 13 animals. Sum of all 'Ganancia' is 4603.
    // 4603 / 13 = 354.07, which rounds to 354.
    expect(expectedAverage).toBe(354);
  });

  // Test case 3: Calculate the average final weight
  test('should correctly calculate the average final weight (Prom. Peso F)', () => {
    const fechaInicial = '2025-06-11';
    const fechaFinal = '2025-08-09';
    const results = ganancias(rawPesajesInput, fechaInicial, '>=', fechaFinal, '<=', false);

    // Calculate the expected average from the mock data
    const totalUltPeso = results.reduce((acc, cur) => acc + parseInt(cur.PesoFinal, 10), 0);
    const expectedAverage = Math.round(totalUltPeso / results.length);

    // Sum of all 'PesoFinal' is 4777.
    // 4777 / 13 = 367.46, which rounds to 367.
    expect(expectedAverage).toBe(367);
  });

  // Test case 4: Handle cases with no matching animals
  test('should return an empty array when no animals match the date range', () => {
    const fechaInicial = '2026-01-01'; // A date with no data
    const fechaFinal = '2026-02-01';
    const results = ganancias(rawPesajesInput, fechaInicial, '>=', fechaFinal, '<=', false);

    expect(results).toEqual([]);
  });
});

let mockPesajes =
[
    {
        "Codigo": "04-E",
        "Chapeta": "0717-6",
        "Marca": "AG",
        "FechaInicial": "2025-06-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "336",
        "PesoFinal": "342",
        "Ganancia": 207,
        "Dias": 29,
        "id": 1
    },
    {
        "Codigo": "06-E",
        "Chapeta": "0709-3?",
        "Marca": "AG",
        "FechaInicial": "2025-06-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "326",
        "PesoFinal": "343",
        "Ganancia": 586,
        "Dias": 29,
        "id": 8
    },
    {
        "Codigo": "05-E",
        "Chapeta": "0726-7",
        "Marca": "AG",
        "FechaInicial": "2025-06-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "336",
        "PesoFinal": "350",
        "Ganancia": 483,
        "Dias": 29,
        "id": 9
    },
    {
        "Codigo": "33-E",
        "Chapeta": "0736-6",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "412",
        "PesoFinal": "418",
        "Ganancia": 207,
        "Dias": 29,
        "id": 0
    },
    {
        "Codigo": "24-E",
        "Chapeta": "0710-1",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "369",
        "PesoFinal": "387",
        "Ganancia": 621,
        "Dias": 29,
        "id": 2
    },
    {
        "Codigo": "31-E",
        "Chapeta": "0732-5",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "378",
        "PesoFinal": "386",
        "Ganancia": 276,
        "Dias": 29,
        "id": 3
    },
    {
        "Codigo": "13-E",
        "Chapeta": "8513-8",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "319",
        "PesoFinal": "322",
        "Ganancia": 103,
        "Dias": 29,
        "id": 4
    },
    {
        "Codigo": "18-E",
        "Chapeta": "0724-2",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "355",
        "PesoFinal": "356",
        "Ganancia": 34,
        "Dias": 29,
        "id": 5
    },
    {
        "Codigo": "15-E",
        "Chapeta": "0740-8",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "361",
        "PesoFinal": "388",
        "Ganancia": 931,
        "Dias": 29,
        "id": 6
    },
    {
        "Codigo": "28-E",
        "Chapeta": "0707-4",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "322",
        "PesoFinal": "343",
        "Ganancia": 724,
        "Dias": 29,
        "id": 7
    },
    {
        "Codigo": "36-E",
        "Chapeta": "0714-3?",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "337",
        "PesoFinal": "338",
        "Ganancia": 34,
        "Dias": 29,
        "id": 10
    },
    {
        "Codigo": "40-E",
        "Chapeta": "0734-1",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "396",
        "PesoFinal": "399",
        "Ganancia": 103,
        "Dias": 29,
        "id": 11
    },
    {
        "Codigo": "16-E",
        "Chapeta": "0720-0",
        "Marca": "AG",
        "FechaInicial": "2025-07-11",
        "FechaFinal": "2025-08-09",
        "PesoInicial": "351",
        "PesoFinal": "367",
        "Ganancia": 552,
        "Dias": 29,
        "id": 12
    }
]

