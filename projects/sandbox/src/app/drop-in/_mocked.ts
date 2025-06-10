import { DropInModel } from './_model';
const dateNow = new Date();
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
export const modelData: Array<DropInModel> = [];
[...Array(100).keys()].forEach((i: number) => {
  const letter = alphabet[i % alphabet.length];
  const triple = `${letter}${letter}${letter}`;
  const tripleId = `${i}${i}${i}`;
  modelData.push({
    id: `${i}`,
    name: `${triple}: ${triple.toUpperCase()} ${i} / ${tripleId}`,
    description: `The description (${letter}) of ${i}`,
    date: new Date(dateNow.getDate() + i).toISOString()
  });
});
