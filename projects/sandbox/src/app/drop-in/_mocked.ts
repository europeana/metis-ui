import { DropInModel } from './_model';

const dateNow = new Date();

export const modelData: Array<DropInModel> = [
  {
    id: '0',
    description: 'Anon',
    date: new Date(dateNow.getDate() - 2).toISOString()
  },
  {
    id: '11111111',
    name: 'AAAAAA',
    description: 'The description',
    date: new Date(dateNow.getDate() - 1).toISOString()
  },
  {
    id: '2',
    name: 'BB BBBBBBBB',
    description: 'The description could be really long, or short or really short or just long',
    date: dateNow.toISOString()
  },
  {
    id: '3333',
    name: 'CCC CCC CCCCC - (all one line) - CCC CCC CCC CCC ',
    description: 'The description could be really long, or short',
    date: new Date(dateNow.getDate() + 1).toISOString()
  },
  {
    id: '444',
    name: 'DDDD',
    description: 'The description',
    date: new Date(dateNow.getDate() + 2).toISOString()
  },
  {
    id: '55555',
    name: 'E'
  }
];

const alphabet = 'ABCDEFDHIJKL';

[...Array(100).keys()].forEach((i: number) => {
  const x = [...Array(i % 8).keys()].map(() => 'x').join('');

  modelData.push({
    id: `${i}`,
    name: '' + alphabet[i < alphabet.length ? i : i % alphabet.length],
    description: `The description (${x}) of ${i}`,
    date: new Date(dateNow.getDate() + i).toISOString()
  });
});
