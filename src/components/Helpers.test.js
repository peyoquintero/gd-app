import {ganancias} from './Helpers';

test('ganancias: vacio', () => {
  //
  let result = ganancias([],'2023-1-1',true,'2023-10-10',true,false);
  expect(result).toEqual([]);
});


