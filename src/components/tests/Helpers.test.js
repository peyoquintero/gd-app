/* eslint-disable no-undef */
import {
  matchCodigo,
  filteredGData,
  cleanData,
  captionCabezas,
  captionGanancia,
  captionMedia,
  captionDias,
  captionUltPeso,
  validLoteOptions,
  mapApiDataToPesajes,
  resurrect,
  ganancias,
  compareNumAlphas,
} from '../Helpers';

// Mock getPesajesByCodigo used by resurrect
jest.mock('../HelperInventario', () => ({
  getPesajesByCodigo: jest.fn(),
}));

import { getPesajesByCodigo } from '../HelperInventario';

describe('Helpers.js', () => {
  describe('matchCodigo', () => {
    test('matches wildcard prefix', () => {
      expect(matchCodigo('abc123', '*ab')).toBe(true);
      expect(matchCodigo('xyz', '*ab')).toBe(false);
    });

    test('matches substring when no wildcard', () => {
      expect(matchCodigo('abc123', 'bc1')).toBe(true);
      expect(matchCodigo('abc123', 'zzz')).toBe(false);
    });
  });

  describe('filteredGData', () => {
    const rows = [
      { Codigo: 'A123', Marca: 'RED', Peso: '200', Operacion: 'COMPRA' },
      { Codigo: 'B234', Marca: 'BLU', Peso: '250', Operacion: 'VENTA' },
      { Codigo: 'C345', Marca: 'GRN', Peso: '300', Operacion: 'COMPRA' },
    ];

    test('non-exact search across fields (excluding one column)', () => {
      const res = filteredGData([...rows], 'a1', 'Peso', false);
      expect(res).toHaveLength(1);
      expect(res[0].Codigo).toBe('A123');
    });

    test('exact search across fields', () => {
      const res = filteredGData([...rows], 'blu', 'Peso', true);
      expect(res).toHaveLength(1);
      expect(res[0].Marca).toBe('BLU');
    });

    test('multi-key search with ";" (OR semantics)', () => {
      const res = filteredGData([...rows], 'blu;grn', 'Peso', false);
      expect(res).toHaveLength(2);
      expect(res.map(r => r.Marca).sort()).toEqual(['BLU', 'GRN']);
    });

    test('AND search with "^" across all values', () => {
      const data = [{ a: 'red', b: 'fox', c: 'jumps' }];
      const res = filteredGData([...data], 'red^jumps', 'Peso', false);
      expect(res).toHaveLength(1);
    });
  });

  describe('cleanData', () => {
    test('filters by Ganancia range and positive weights', () => {
      const items = [
        { Ganancia: 100, PesoInicial: 1, PesoFinal: 2 },
        { Ganancia: -2000, PesoInicial: 1, PesoFinal: 2 },  // out of min
        { Ganancia: 150, PesoInicial: 0, PesoFinal: 2 },    // invalid weight
        { Ganancia: 5000, PesoInicial: 1, PesoFinal: 2 },   // out of max
      ];
      const res = cleanData(items, -1000, 2000);
      expect(res).toHaveLength(1);
      expect(res[0].Ganancia).toBe(100);
    });
  });

  describe('captions', () => {
    const data = [
      { Ganancia: 100, FechaInicial: '2024-01-01', FechaFinal: '2024-01-11', Dias: 10, PesoFinal: 450 },
      { Ganancia: 300, FechaInicial: '2024-02-01', FechaFinal: '2024-02-06', Dias: 5, PesoFinal: 480 },
    ];

    test('captionCabezas', () => {
      expect(captionCabezas(data.length, data.length)).toMatch(/Cabezas:\s*2/);
      expect(captionCabezas(0, 0)).toMatch(/No hay datos disponibles/);
    });

    test('captionGanancia (weighted by days)', () => {
      // Weighted avg = round((100*10 + 300*5)/(10+5)) = round(2100/15) = 140
      expect(captionGanancia(data)).toBe('Ganancia(grs):  167');
    });

    test('captionMedia (median of Ganancia)', () => {
      expect(captionMedia(data)).toBe('Media: 200 ');
    });

    test('captionDias (average of Dias)', () => {
      expect(captionDias(data)).toBe('Dias:  8'); // round((10+5)/2)=8
    });

    test('captionUltPeso (median; suppressed if > 500)', () => {
      const below = [{ PesoFinal: 450 }, { PesoFinal: 470 }, { PesoFinal: 490 }];
      expect(captionUltPeso(below)).toMatch(/Prom\. Ultimo Peso/);
      const above = [{ PesoFinal: 600 }, { PesoFinal: 620 }, { PesoFinal: 610 }];
      expect(captionUltPeso(above)).toBe('');
    });
  });

  describe('validLoteOptions', () => {
    test('adds "*" and filters out "NULL"', () => {
      const lotes = ['L1', 'NULL', 'L2'];
      const res = validLoteOptions([...lotes]);
      expect(res).toContain('*');
      expect(res).not.toContain('NULL');
      expect(res).toEqual(expect.arrayContaining(['L1', 'L2']));
    });
  });

  describe('mapApiDataToPesajes', () => {
    test('maps Google Sheets API data and uppercases values', () => {
      const apiResult = {
        values: [
          ['Codigo', 'Marca', 'Operacion'],
          ['a1', 'az', 'compra'],
          ['b2', 'by', 'venta'],
        ],
      };
      const rows = mapApiDataToPesajes(apiResult);
      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual({ Codigo: 'A1', Marca: 'AZ', Operacion: 'COMPRA' });
      expect(rows[1].Operacion).toBe('VENTA');
    });
  });

  describe('resurrect', () => {
    test('returns loners with only a terminal operation and those with duplicate terminal operations', () => {
      // Shape expected by resurrect
      getPesajesByCodigo.mockReturnValue({
        X1: {
          Codigo: 'X1',
          // This one is a "loner" with a single pesaje and terminal op at top-level
          pesajes: [{ Operacion: 'VENTA', Fecha: '2024-01-10' }],
          Operacion: 'VENTA',
        },
        Y2: {
          Codigo: 'Y2',
          pesajes: [
            { Operacion: 'COMPRA', Fecha: '2024-01-01' },
            { Operacion: 'VENTA', Fecha: '2024-02-01' }, // last is terminal
            { Operacion: 'MUERTE', Fecha: '2024-03-01' }, // also terminal earlier (will satisfy "otrosPesajes some terminal")
          ],
        },
        Z3: {
          Codigo: 'Z3',
          pesajes: [{ Operacion: 'COMPRA', Fecha: '2024-01-01' }], // should not be included
        },
        W1: {
          Codigo: 'W1',
          pesajes: [{ Operacion: 'COMPRA', Fecha: '2024-01-01' }, 
                    { Operacion: 'CORRECCION', Fecha: '2024-03-01' }]
        },
        W2: {
          Codigo: 'W2',
          pesajes: [{ Operacion: 'COMPRA', Fecha: '2024-01-01' }, 
                    { Operacion: 'VENTA', Fecha: '2024-03-01' },
                    { Operacion: 'CONTROL', Fecha: '2024-05-01' }
                ]
        },
      });

      const res = resurrect([{ dummy: true }]);
      expect(res.find(r => r.Codigo === 'X1')).toBeTruthy();
      expect(res.find(r => r.Codigo === 'Y2')).toBeTruthy();
      expect(res.find(r => r.Codigo === 'Z3')).toBeFalsy();
      expect(res.find(r => r.Codigo === 'W1')).toBeFalsy();
      expect(res.find(r => r.Codigo === 'W2')).toBeTruthy();
    });
  });

  describe('ganancias', () => {
    const hispesajes = [
      { Codigo: 'C1', Chapeta: 'CH1', Fecha: '2024-01-01', Peso: 200, Operacion: 'COMPRA' },
      { Codigo: 'C1', Chapeta: 'CH1', Fecha: '2024-01-31', Peso: 260, Operacion: 'CONTROL' },
      { Codigo: 'C2', Chapeta: 'CH2', Fecha: '2024-02-01', Peso: 300, Operacion: 'COMPRA' },
    ];

    test('computes per-code metrics within date range and outputs expected fields', () => {
      const out = ganancias(
        hispesajes,
        '2024-01-01',
        false,
        '2024-01-31',
        false,
        false
      );

      expect(Array.isArray(out)).toBe(true);
      // Only C1 has 2+ pesajes
      expect(out).toHaveLength(1);
      const row = out[0];
      expect(row).toMatchObject({
        Codigo: 'C1',
        Chapeta: 'CH1',
        PesoInicial: 200,
        PesoFinal: 260,
        Dias: 30,
      });
      // Ganancia grams/day: round((60/30)*1000) = 2000
      expect(row.Ganancia).toBe(2000);
      // Dates in ISO format
      expect(row.FechaInicial).toBe('2024-01-01');
      expect(row.FechaFinal).toBe('2024-01-31');
    });
  });

  describe('compareNumAlphas', () => {
    test('numbers-first comparison then alpha', () => {
      expect(compareNumAlphas('10A', '2B')).toBe(1);  // 10 > 2
      expect(compareNumAlphas('2B', '2A')).toBeGreaterThan(0); // 'B' > 'A'
      expect(compareNumAlphas('A2', 'B1')).toBeLessThan(0); // A < B (no numeric prefix)
    });
  });
});