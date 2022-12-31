# Description of Day 21 Puzzle Solution

This document describes how to solve the day 21 puzzle using the example given in the puzzle text.

## Parsing

We parse the input into a tree, where each node has either a simple value, or an operator and two
operands, which are child nodes. (In part two, one node will be changed to have neither a value nor
an operator and operands; it is a variable we're solving for.)

```txt
(+           // root
  (/         // pppw
    (+       // cczh
      4      // sslz
      (*     // lgvd
        2    // ljgn
        (-   // ptdq
          5  // humn
          3  // dvpt
        )
      )
    )
    4        // lfqf
  )
  (*         // sjmn
    (-       // drzm
      32     // hmdt
      2      // zczc
    )
    5        // dbpl
  )
)
```

## Part 1

We define a recursive `evaluate()` operation, where we pass in a tree node, and it performs a
depth-first traversal of the tree. At every node where both operands are numbers, we evaluate the
expression at that node and replace the entire node with the answer.

Step 1:

```txt
(+           // root
  (/         // pppw
    (+       // cczh
      4      // sslz
      (*     // lgvd
        2    // ljgn
        2
      )
    )
    4        // lfqf
  )
  (*         // sjmn
    (-       // drzm
      32     // hmdt
      2      // zczc
    )
    5        // dbpl
  )
)
```

Step 2:

```txt
(+           // root
  (/         // pppw
    (+       // cczh
      4      // sslz
      4
    )
    4        // lfqf
  )
  (*         // sjmn
    (-       // drzm
      32     // hmdt
      2      // zczc
    )
    5        // dbpl
  )
)
```

Step 3:

```txt
(+           // root
  (/         // pppw
    8
    4        // lfqf
  )
  (*         // sjmn
    (-       // drzm
      32     // hmdt
      2      // zczc
    )
    5        // dbpl
  )
)
```

Step 4:

```txt
(+           // root
  2
  (*         // sjmn
    (-       // drzm
      32     // hmdt
      2      // zczc
    )
    5        // dbpl
  )
)
```

Step 5:

```txt
(+           // root
  2
  (*         // sjmn
    30
    5        // dbpl
  )
)
```

Step 6:

```txt
(+           // root
  2
  150
)
```

Step 7:

```txt
152
```

## Part 2

Update the tree so that `root`'s operator is `=`, and `humn` is now an unknown value:

```txt
(=           // root
  (/         // pppw
    (+       // cczh
      4      // sslz
      (*     // lgvd
        2    // ljgn
        (-   // ptdq
          ?  // humn
          3  // dvpt
        )
      )
    )
    4        // lfqf
  )
  (*         // sjmn
    (-       // drzm
      32     // hmdt
      2      // zczc
    )
    5        // dbpl
  )
)
```

Run `evaluate()` from part 1 on the tree:

```txt
(=           // root
  (/         // pppw
    (+       // cczh
      4      // sslz
      (*     // lgvd
        2    // ljgn
        (-   // ptdq
          ?  // humn
          3  // dvpt
        )
      )
    )
    4        // lfqf
  )
  150
)
```

The entire tree now consists of nodes where one of the two operands is a number. At `root`, the
child branch must equal its sibling number (in the example, `150`). Starting with the topmost node
of `root`'s child branch, perform a reverse operation to determine the value that causes it to be
equal to the number, then strip out that node and promote the non-numeric operand underneath. Repeat
until you reach the variable.

Start:

```txt
150 = (/         // pppw
        (+       // cczh
          4      // sslz
          (*     // lgvd
            2    // ljgn
            (-   // ptdq
              ?  // humn
              3  // dvpt
            )
          )
        )
        4        // lfqf
      )
```

Step 1: `150 * 4 = 600`

```txt
600 = (+       // cczh
        4      // sslz
        (*     // lgvd
          2    // ljgn
          (-   // ptdq
            ?  // humn
            3  // dvpt
          )
        )
      )
```

Step 2: `600 - 4 = 596`

```txt
596 = (*     // lgvd
        2    // ljgn
        (-   // ptdq
          ?  // humn
          3  // dvpt
        )
      )
```

Step 3: `596 / 2 = 298`

```txt
298 = (-   // ptdq
        ?  // humn
        3  // dvpt
      )
```

Step 4: `298 + 3 = 301`

```txt
301 = humn
```
