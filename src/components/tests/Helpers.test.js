/* eslint-disable no-undef */
import {
  matchCodigo,
  filteredGData,
  cleanData,
  parseCleanDataRange,
  captionCabezas,
  captionGanancia,
  captionMedia,
  captionDias,
  captionUltPeso,
  mapApiDataToPesajes,
  resurrect,
  ganancias,
  findPotentialMatches,
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
    test('filters by Ganancia range and positive weights (short period ≤90 days)', () => {
      const items = [
        { Ganancia: 100,   Dias: 30, PesoInicial: 1, PesoFinal: 2 }, // passes
        { Ganancia: -2000, Dias: 30, PesoInicial: 1, PesoFinal: 2 }, // below min
        { Ganancia: 150,   Dias: 30, PesoInicial: 0, PesoFinal: 2 }, // invalid weight
        { Ganancia: 5000,  Dias: 30, PesoInicial: 1, PesoFinal: 2 }, // above shortMax
      ];
      const res = cleanData(items, -1000, 2000, 1500);
      expect(res).toHaveLength(1);
      expect(res[0].Ganancia).toBe(100);
    });

    test('applies stricter longMax for periods >90 days', () => {
      const items = [
        { Ganancia: 800,  Dias: 120, PesoInicial: 1, PesoFinal: 2 }, // passes (< longMax 1000)
        { Ganancia: 1200, Dias: 120, PesoInicial: 1, PesoFinal: 2 }, // above longMax, excluded
        { Ganancia: 1200, Dias: 60,  PesoInicial: 1, PesoFinal: 2 }, // same gain but short period, passes
      ];
      const res = cleanData(items, -200, 1800, 1000);
      expect(res).toHaveLength(2);
      expect(res.map(r => r.Dias)).toEqual([120, 60]);
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

  describe('parseCleanDataRange', () => {
    test('parses 3-part format', () => {
      expect(parseCleanDataRange('-0200/1800/1000')).toEqual({ min: -200, shortMax: 1800, longMax: 1000 });
    });

    test('2-part format uses shortMax as longMax (backward compat)', () => {
      expect(parseCleanDataRange('-0200/1800')).toEqual({ min: -200, shortMax: 1800, longMax: 1800 });
    });

    test('null input returns defaults', () => {
      expect(parseCleanDataRange(null)).toEqual({ min: -200, shortMax: 1800, longMax: 1000 });
    });

    test('undefined input returns defaults', () => {
      expect(parseCleanDataRange(undefined)).toEqual({ min: -200, shortMax: 1800, longMax: 1000 });
    });
  });

  describe('ganancias', () => {
    const hispesajes = [
      { Codigo: 'C1', Chapeta: 'CH1', Marca: 'A', Fecha: '2024-01-01', Peso: 200, Operacion: 'COMPRA' },
      { Codigo: 'C1', Chapeta: 'CH1', Marca: 'A', Fecha: '2024-01-31', Peso: 260, Operacion: 'CONTROL' },
      { Codigo: 'C2', Chapeta: 'CH2', Marca: 'A', Fecha: '2024-02-01', Peso: 300, Operacion: 'COMPRA' },
    ];

    test('computes per-code metrics within date range and outputs expected fields', () => {
      const out = ganancias(hispesajes, '2024-01-01', false, '2024-01-31', false, false);

      expect(Array.isArray(out)).toBe(true);
      expect(out).toHaveLength(1);
      const row = out[0];
      expect(row).toMatchObject({
        Codigo: 'C1',
        Chapeta: 'CH1',
        PesoInicial: 200,
        PesoFinal: 260,
        Dias: 30,
      });
      expect(row.Ganancia).toBe(2000); // round((60/30)*1000)
      expect(row.FechaInicial).toBe('2024-01-01');
      expect(row.FechaFinal).toBe('2024-01-31');
    });

    test('>= / <= comparators include animal whose pesajes span the range', () => {
      const pesajes = [
        { Codigo: 'T1', Chapeta: '', Marca: 'A', Fecha: '2024-01-01', Peso: '200', Operacion: 'COMPRA' },
        { Codigo: 'T1', Chapeta: '', Marca: 'A', Fecha: '2024-04-01', Peso: '293', Operacion: 'CONTROL' },
      ];
      const out = ganancias(pesajes, '2024-01-01', '>=', '2024-04-01', '<=', false);
      expect(out).toHaveLength(1);
      expect(out[0].Codigo).toBe('T1');
      expect(out[0].Dias).toBe(91); // Jan(31)+Feb(29)+Mar(31)=91
    });

    test('= comparator excludes animals with no pesaje on the exact dates', () => {
      const pesajes = [
        // E1 has pesajes on exactly the boundary dates
        { Codigo: 'E1', Chapeta: '', Marca: 'A', Fecha: '2024-03-01', Peso: '250', Operacion: 'COMPRA' },
        { Codigo: 'E1', Chapeta: '', Marca: 'A', Fecha: '2024-06-01', Peso: '350', Operacion: 'CONTROL' },
        // E2 has no pesaje on either boundary date
        { Codigo: 'E2', Chapeta: '', Marca: 'A', Fecha: '2024-01-01', Peso: '200', Operacion: 'COMPRA' },
        { Codigo: 'E2', Chapeta: '', Marca: 'A', Fecha: '2024-05-01', Peso: '300', Operacion: 'CONTROL' },
      ];
      const out = ganancias(pesajes, '2024-03-01', '=', '2024-06-01', '=', false);
      expect(out.map(r => r.Codigo)).toEqual(['E1']);
    });

    test('filtroVentas=true uses COMPRA as minP and VENTA as maxP, excludes animals without VENTA', () => {
      const pesajes = [
        { Codigo: 'V1', Chapeta: '', Marca: 'A', Fecha: '2024-01-01', Peso: '200', Operacion: 'COMPRA' },
        { Codigo: 'V1', Chapeta: '', Marca: 'A', Fecha: '2024-04-01', Peso: '300', Operacion: 'VENTA' },
        { Codigo: 'V2', Chapeta: '', Marca: 'A', Fecha: '2024-01-01', Peso: '250', Operacion: 'COMPRA' },
        { Codigo: 'V2', Chapeta: '', Marca: 'A', Fecha: '2024-02-01', Peso: '280', Operacion: 'CONTROL' },
      ];
      const out = ganancias(pesajes, '2024-01-01', '>=', '2024-04-30', '<=', true);
      expect(out.map(r => r.Codigo)).toEqual(['V1']);
      expect(out[0].PesoInicial).toBe('200'); // COMPRA weight (string as stored in spreadsheet)
      expect(out[0].PesoFinal).toBe('300');   // VENTA weight
    });
  });

  describe('findPotentialMatches', () => {
    beforeEach(() => {
      getPesajesByCodigo.mockReset();
    });

    test('returns empty array for empty or null input', () => {
      expect(findPotentialMatches([])).toEqual([]);
      expect(findPotentialMatches(null)).toEqual([]);
    });

    test('matches an unidentified sale to an animal within tolerance', () => {
      // A1: COMPRA 2024-01-01 at 200kg; 100 days to 2024-04-10
      // Projected with GDP 0.350 kg/day: 200 + 100*0.350 = 235kg → sale at 235 = 0% diff
      getPesajesByCodigo.mockReturnValue({
        'A1': { Codigo: 'A1', Pesajes: [
          { Operacion: 'COMPRA',    Fecha: '2024-01-01', Peso: '200', Marca: 'X' },
          { Operacion: 'CORRECCION', Fecha: '2024-02-01', Peso: '215', Marca: 'X' },
        ]},
      });
      const out = findPotentialMatches(
        [{ Codigo: '?', Operacion: 'VENTA', Fecha: '2024-04-10', Peso: '235' }],
        0.350, 0.30
      );
      expect(out).toHaveLength(1);
      expect(out[0].Codigo).toBe('A1');
    });

    test('returns no match when sale weight is outside tolerance', () => {
      getPesajesByCodigo.mockReturnValue({
        'A1': { Codigo: 'A1', Pesajes: [
          { Operacion: 'COMPRA',    Fecha: '2024-01-01', Peso: '200', Marca: 'X' },
          { Operacion: 'CORRECCION', Fecha: '2024-02-01', Peso: '215', Marca: 'X' },
        ]},
      });
      // Projected = 235kg but sale = 400kg → 41% diff, outside 30% tolerance
      const out = findPotentialMatches(
        [{ Codigo: '?', Operacion: 'VENTA', Fecha: '2024-04-10', Peso: '400' }],
        0.350, 0.30
      );
      expect(out).toHaveLength(0);
    });

    test('one-to-one: when two animals match the same sale, only the best match is returned', () => {
      // A1 projected = 235kg (0% diff), A2 projected = 245kg (~4.3% diff); sale = 235
      getPesajesByCodigo.mockReturnValue({
        'A1': { Codigo: 'A1', Pesajes: [
          { Operacion: 'COMPRA',    Fecha: '2024-01-01', Peso: '200', Marca: 'X' },
          { Operacion: 'CORRECCION', Fecha: '2024-02-01', Peso: '215', Marca: 'X' },
        ]},
        'A2': { Codigo: 'A2', Pesajes: [
          { Operacion: 'COMPRA',    Fecha: '2024-01-01', Peso: '210', Marca: 'X' },
          { Operacion: 'CORRECCION', Fecha: '2024-02-01', Peso: '225', Marca: 'X' },
        ]},
      });
      const out = findPotentialMatches(
        [{ Codigo: '?', Operacion: 'VENTA', Fecha: '2024-04-10', Peso: '235' }],
        0.350, 0.30
      );
      expect(out).toHaveLength(1);
      expect(out[0].Codigo).toBe('A1');
    });

    test('smart GDP: uses actual gain between COMPRA and last CONTROL when forceDailyGain=false', () => {
      // S1: COMPRA 200kg (2024-01-01) → CONTROL 230kg (2024-02-10, 40 days later)
      // Smart GDP = (230-200)/40 = 0.750 kg/day
      // baseline = CONTROL; 60 days to sale (2024-04-10): projected = 230 + 60*0.750 = 275kg
      // sale at 275 → 0% diff → matches with tight tolerance of 5%
      // But with forceDailyGain=true (default 0.350): projected = 230 + 60*0.350 = 251 → 8.7% diff → no match
      getPesajesByCodigo.mockReturnValue({
        'S1': { Codigo: 'S1', Pesajes: [
          { Operacion: 'COMPRA',    Fecha: '2024-01-01', Peso: '200', Marca: 'X' },
          { Operacion: 'CONTROL',   Fecha: '2024-02-10', Peso: '230', Marca: 'X' },
          { Operacion: 'CORRECCION', Fecha: '2024-02-15', Peso: '232', Marca: 'X' },
        ]},
      });
      const allPesajes = [{ Codigo: '?', Operacion: 'VENTA', Fecha: '2024-04-10', Peso: '275' }];

      const withSmartGDP = findPotentialMatches(allPesajes, 0.350, 0.05, false);
      expect(withSmartGDP).toHaveLength(1);

      const withForcedGDP = findPotentialMatches(allPesajes, 0.350, 0.05, true);
      expect(withForcedGDP).toHaveLength(0);
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