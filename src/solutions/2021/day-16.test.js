const solver = require('./day-16');

const EXAMPLES = [
  {
    input: 'D2FE28',
    tree: { version: 6, typeId: 4, value: 2021 },
    answers: [ 6, 2021 ],
  },
  {
    input: '38006F45291200',
    tree: {
      version: 1,
      typeId: 6,
      subpackets: [
        { version: 6, typeId: 4, value: 10 },
        { version: 2, typeId: 4, value: 20 },
      ],
    },
    answers: [ 9, 1 ],
  },
  {
    input: 'EE00D40C823060',
    tree: {
      version: 7,
      typeId: 3,
      subpackets: [
        { version: 2, typeId: 4, value: 1 },
        { version: 4, typeId: 4, value: 2 },
        { version: 1, typeId: 4, value: 3 },
      ],
    },
    answers: [ 14, 3 ],
  },
  {
    input: 'C200B40A82',
    answers: [ 14, 3 ],
  },
  {
    input: '04005AC33890',
    answers: [ 8, 54 ],
  },
  {
    input: '880086C3E88112',
    answers: [ 15, 7 ],
  },
  {
    input: 'CE00C43D881120',
    answers: [ 11, 9 ],
  },
  {
    input: 'D8005AC2A8F0',
    answers: [ 13, 1 ],
  },
  {
    input: 'F600BC2D8F',
    answers: [ 19, 0 ],
  },
  {
    input: '9C005AC2F8F0',
    answers: [ 16, 0 ],
  },
  {
    input: '9C0141080250320F1802104A08',
    answers: [ 20, 1 ],
  },
];

test('Day 16', () => {
  EXAMPLES.forEach(example => {
    if (example.tree) {
      expect(solver(example.input, true)).toEqual(example.tree);
    }

    expect(solver(example.input)).toEqual(example.answers);
  });
});
