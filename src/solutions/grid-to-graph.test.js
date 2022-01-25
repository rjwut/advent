const gridToGraph = require('./grid-to-graph');

describe('Grid to graph', () => {
  test('Minimal example', () => {
    const graph = gridToGraph(`#####
#S.E#
#####`);
    expect(graph.toString()).toEqual(`S (1,1): E=2
E (1,3): S=2`);
  });

  test('Node connctions can\'t bypass other nodes', () => {
    const graph = gridToGraph(`#########
#b.A.@.a#
#########`);
    expect(graph.toString()).toEqual(`b (1,1): A=2
A (1,3): b=2, @=2
@ (1,5): A=2, a=2
a (1,7): @=2`);
  });

  test('Open area', () => {
    const graph = gridToGraph(`###########
#.A.....B.#
#.........#
#.........#
#....C....#
###########`);
    expect(graph.toString()).toEqual(`A (1,2): B=6, C=6
B (1,8): A=6, C=6
C (4,5): A=6, B=6`);
  });

  test('More complex example', () => {
    const graph = gridToGraph(`#################
#i.G..c...e..H.p#
########.########
#j.A..b...f..D.o#
########@########
#k.E..a...g..B.n#
########.########
#l.F..d...h..C.m#
#################`);
    expect(graph.toString()).toEqual(`i (1,1): G=2
G (1,3): i=2, c=3
c (1,6): G=3, e=4, @=5, b=6, f=6
e (1,10): H=3, c=4, @=5, b=6, f=6
H (1,13): p=2, e=3
p (1,15): H=2
j (3,1): A=2
A (3,3): j=2, b=3
b (3,6): A=3, @=3, f=4, c=6, e=6
f (3,10): @=3, D=3, b=4, c=6, e=6
D (3,13): o=2, f=3
o (3,15): D=2
@ (4,8): b=3, f=3, a=3, g=3, c=5, e=5, d=5, h=5
k (5,1): E=2
E (5,3): k=2, a=3
a (5,6): E=3, @=3, g=4, d=6, h=6
g (5,10): @=3, B=3, a=4, d=6, h=6
B (5,13): n=2, g=3
n (5,15): B=2
l (7,1): F=2
F (7,3): l=2, d=3
d (7,6): F=3, h=4, @=5, a=6, g=6
h (7,10): C=3, d=4, @=5, a=6, g=6
C (7,13): m=2, h=3
m (7,15): C=2`);
  });
});
