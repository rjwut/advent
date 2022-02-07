const solver = require('./day-19');

const EXAMPLE = `     |          
     |  +--+    
     A  |  C    
 F---|----E|--+ 
     |  |  |  D 
     +B-+  +--+ `;

test('Day 19', () => {
  expect(solver(EXAMPLE)).toEqual([ 'ABCDEF', 38 ]);
});
