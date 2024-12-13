# Explanation of Day 13

You could solve part one with an iterative approach, but part two makes that infeasible. This is where the math comes in. The solution for each machine is a system of two linear equations:

```math
Ax_a + Bx_b = x_p\\
Ay_a + By_b = y_p
```

...where:

- Each press of the A button moves the claw by $(x_a,y_a)$.
- Each press of the B button moves the claw by $(x_b,y_b)$.
- The prize is located at $(x_p,y_p)$.
- We are solving for $A$ and $B$, the number of times to press the A and B buttons, respectively.

We can solve this system as follows:

1. Solve both equations for $A$.
2. Set them equal to each other.
3. Solve the result for $B$.
4. Plug in the values and compute $B$.
5. Pick either of the equations solved for $A$, and plugin in the values and the answer for $B$ to get $A$.

Let's solve the $X$-axis equation for $A$:

```math
Ax_a = x_p - Bx_b
```

```math
A = \frac{x_p - Bx_b}{x_a}
```

Now we do the same for the $Y$-axis:

```math
Ay_a = y_p - By_b
```

```math
A = \frac{y_p - By_b}{y_a}
```

Set them equal to each other:

```math
\frac{x_p - Bx_b}{x_a} = \frac{y_p - By_b}{y_a}
```

Isolate $B$:

```math
\frac{x_p}{x_a}-\frac{Bx_b}{x_a} = \frac{y_p}{y_a}-\frac{By_b}{y_a}
```

```math
B\left(\frac{y_b}{y_a}-\frac{x_b}{x_a}\right)=\frac{y_p}{y_a}-\frac{x_p}{x_a}
```

```math
B\left(\frac{x_ay_b-x_by_a}{x_ay_a}\right)=\frac{x_ay_p-x_py_a}{x_ay_a}
```

```math
B(x_ay_b-x_by_a)=x_ay_p-x_py_a
```

```math
B=\frac{x_ay_p-x_py_a}{x_ay_b-x_by_a}
```

Here we'll plug in the values from the first machine in the example for part 1:

```math
B = \frac{94\cdot5400-8400\cdot34}{94\cdot67-22\cdot34}
= \frac{507600-285600}{6298-748}
= \frac{222000}{5550}
= 40
```

Now we plug that into one of the previous equations solved for $A$:

```math
A = \frac{x_p - Bx_b}{x_a}
= \frac{8400 - 40\cdot22}{94}
= \frac{8400 - 880}{94}
= \frac{7520}{94}
= 80
```

As explained in the puzzle, the prize can be obtained in the first machine by pressing the A button 80 times and the B button 40 times. Since pressing the A button costs three tokens and pressing the B button costs one, the total cost is:

```math
cost = 80\cdot3 + 40 = 240 + 40 = 280
```

The same process is repeated for the other machines. If $A$ or $B$ are not integers, the prize is not obtainable on that machine. Summing $cost$ for each machine where the prize is obtainable gives you the answer to part one.

Part two merely increases $x_p$ and $y_p$ by $10000000000000$. The solution, however, is the same; simply use the new $x_p$ and $y_p$ values in the existing equations to get the values of $A$ and $B$ for part two, and compute the cost as before.
