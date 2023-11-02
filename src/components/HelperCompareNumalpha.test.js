import {compareNumAlphas} from './Helpers';

test('compare: numbers Only', () => {
  //
  let result = compareNumAlphas('1','5')
  expect(result).toEqual(-1);
  result = compareNumAlphas('-1','0')
  expect(result).toEqual(-1);
});

test('compare: Nutresa Format', () => {
  //
  let result = compareNumAlphas('191-02','1N1-05')
  expect(result).toEqual(1);
  result = compareNumAlphas('191-02','192-03')
  expect(result).toEqual(-1);
});

test('compare: Nutresa Mixed with numbers', () => {
  //
  let result = compareNumAlphas('1','2N1-05')
  expect(result).toEqual(-1);
  result = compareNumAlphas('3','2N1-05')
  expect(result).toEqual(1);
});



