# The `Vm` Class

This class lets you define and build a simple virtual machine that executes programs written in a customized machine language. You can programmatically declare the registers and operations the `Vm` supports, and you can extend the class to create additional functionality.

## Classes and Interfaces

- `Vm`: This class represents the entire virtual machine and has methods for controlling it.
- `Parser`: An interface for objects which can parse source code into instructions. Its `parse()` method is expected to accept the source code and return an instance of `Program`.
- `DefaultParser`: The default implementation of the `Parser` interface.
- `Program`: An interface which represents the code being executed. Can execute any single instruction given its offset.
- `DefaultProgram`: The default implementation of `Program` which will be used when another is not provided.

Since JavaScript does not have the explicit concept of an interface, `Parser` and `Program` are implemented as classes whose methods throw `Error`s. When you extend these interfaces, you must override the methods with your own implementations.

## Basic Usage

The basic steps for using a `Vm` with its default parser are as follows:

1. Instantiate the `Vm`.
2. Declare any needed registers.
3. Declare opcodes.
4. `load()` the source code.
5. Invoke `run()`.
6. Inspect the `Vm` for results.

For example, suppose we have the following scenario:

- The program is a string stored in a variable named `source`.
- The program expects there to be two registers named `a` and `b`.
- The program has two opcodes, `add` and `jump`, which you have implemented as functions with the same names.
- After running the program, you wish to print out the value of the `a` register.

This is what that would look like:

```js
const vm = new Vm();
vm.declareRegisters('a', 'b');
vm.parser.opcode('add', add);
vm.parser.opcode('jump', jump);
vm.load(source);
vm.run();
console.log(vm.getRegister('a'));
```

## Registers

The `Vm` will have one or more registers. By default, the only register is one called `ip`, the instruction pointer. This register keeps track of the program offset where the `Vm` is currently executing. You may rename this register by calling `declareIp()`. Programs may directly manipulate the instruction pointer like any other register. The value of the instruction pointer register, whatever its name, is also exposed by the `Vm`'s `ip` property.

By default, attempting to use an unknown register results in an `Error`. This is to help you detect typos in your register names. You must declare any registers that you use other than the instruction pointer register. You do this by passing their names into the `declareRegisters()` method. Unlike `declareIp()`, invoking it multiple times does not remove any previously-declared registers. A newly-declared register starts with a value of `0`.

Alternatively, you may set the `lazyRegisters` property to `true`. Doing so makes it so that if an attempt is made to read or write to a register that does not exist, it will be automatically provisioned immediately. This may be desirable if you don't know what registers will be used in advance, but you lose the ability to detect typos in register names.

There are several other methods for working with registers:

- `hasRegister(string)`: Checks whether a register exists. (Does not trigger automatic creation under when `lazyRegisters` is `true`.)
- `getRegister(string)`: Returns a register's current value.
- `setRegister(string, number)`: Sets a register's value.
- `addRegister(string, number)`: Adds a value to a register's existing value.
- `exportRegisters()`: Returns the current state of the registers as a plain object.

## `Parser`

A `Parser` is responsible for converting source code into a `Program` instance, the object responsible for actually executing the instruction at any given offset. Invoking `load()` on the `Vm` instance will trigger the `Parser`, and set the `Vm`'s `program` property to the generated `Program` instance.

### `DefaultParser`

The default implementation of `Parser` is `DefaultParser`. It expects the source to be a mutli-line string, where each line represents an instruction. (Windows line endings are automatically converted to newlines.) The line starts with an opcode token, which identifies the operation to perform. The instruction may also have arguments; if they are present, they come after the opcode token, with a separator between them (a space by default, customizable with the `opcodeSeparator` property). There are also separaters between the arguments (also a space by default, customizable with the `argSeparator` property).

Before parsing, opcodes must be registered by invoking `opcode()`. This is how you provide the behavior for each opcode. If an unknown opcode is encountered, an error will be thrown.

The `opcode()` method expects two arguments: the opcode string to register, and a function implementing that operation. The implementation function will receive to arguments when invoked: a reference to the `Vm` instance, and an array of the arguments for the instruction. Each argument is either an integer, or string giving the name of a register whose value to be used. (An argument token will be considered an integer if it matches the `RegExp` `/^[+-]?\d+$/`). If the parser encounters an unknown register name, it will throw an `Error`. The `eval()` method on the `Vm` instance will automatically coerce arguments to their actual values for you.

### Custom `Parser` Implementations

When you invoke `load()` on the `Vm`, it uses the `Parser` instance stored on the `Vm`'s `parser` property. By default, this is an instance of `DefaultParser`. To use your own `Parser` implementation, do the following:

1. Write a class that extends `Parser`.
2. Implement the `parse()` method. Return an instance of a `Program` subclass.
3. Set the `parser` property of the `Vm` to an instance of your new `Parser` subclass.

## `Program`

The `Program` interface is for objects that are responsible for actually executing the instruction at any given offset. `DefaultParser` returns a `DefaultProgram` instance when parsing the source code. You may provide your own `Program` subclass and write a custom `Parser` to return it.

### `DefaultProgram`

The `DefaultProgram` class is the default implementation of `Program`. Its constructor expects to get an array of objects, each representing an instruction. Each instruction object has the following properties:

- `op: Function`: A function that implements the operation to perform.
- `args: Array<number|string>`: The arguments to pass to the function; each argument is either an integer or the name of a register.

To execute an instruction, it selects the instruction in the array at the index corresponding to the current instruction offset, then invokes `op`, passing in `args`.

### Custom `Program` Implementations

When you write a custom `Parser`, you can make use of the `DefaultProgram` class, or implement your own `Program` subclass. To do the latter, do the following:

1. Write a class that extends `Program`.
2. Implement the `length` property, which should give the size of the program's offset range. Usually, this is equal to the number of instructions the program has, but some programs may implement this differently (e.g. Intcode from 2019).
3. Implement the `get()` method. It receives an offset argument and returns the instruction at that offset.
4. Implement the `findOffset()` method. This method receives a predicate function which returns `true` if an instruction matches a desired condition, or `false` if it does not. The `findOffset()` method should return the offset of the first instruction that matches the predicate, or `-1` if no instruction matches.
5. Implement the `execute()` method. It will receive two arguments: a reference to the `Vm` instance, and the offset of the instruction to execute.
6. Have your custom `Parser` instance's `parse()` method return an instance of your custom `Program` subclass.

## Execution

Execute your program by invoking `run()`. This will cause the `Vm` to execute instructions until one of the following occurs:

- The instruction pointer goes out of range of the program.
- The `Vm`'s `halt()` or `terminate()` method is invoked (typically by an operator or listener).
- The VM becomes blocked on input. (See the **Input** section below.)
- An error occurs.

Alternatively, you may step through the program one instruction at a time by calling `step()`. Each time you call `step()`, one instruction will be executed, then the program will halt, allowing you to inspect its state before continuing by calling `step()` or `run()`.

The differences between `halt()` and `terminate()` are:

- The `halt()` method stops execution temporarily, meaning you can resume right where you left off by calling `step()` or `run()`. The `terminate()` method stops execution permanently, requiring you to `reset()` the VM's state and start over before you can run it again.
- You may optionally pass an `Error` into `terminate()`.

The `state` property is a string that describes the current execution state of the `Vm`:

- `'ready'`: The `Vm` is ready to execute instructions. You may invoke `step()` or `run()` to proceed.
- `'running'`: The `Vm` is currently executing instructions. You may invoke `halt()` or `terminate()` to stop.
- `'blocked'`: The `Vm` is blocked on input. You must invoke `enqueueInput()`, which will change the state to `'ready'`.
- `'terminated'`: The `Vm` has ended (possibly with an error).

## Events

The execution of a single step is as follows:

1. Retrieve the instruction located at the offset stored in the instruction pointer.
2. Check whether a patch has been installed at this offset, if so, execute the patch instead and skip to step 4.
3. Execute the instruction.
4. If exection has been stopped, skip the remaining steps.
5. Increment the instruction pointer, if the `Vm` is configured to do so.

The `Vm` class extends `EventEmitter`, so you can register listeners to be notified of events. These are the events which the `Vm` can emit during execution:

- `prestep`: The `Vm` is about to execute a step. This occurs just before step 1 above, meaning the listener can modify the instruction pointer to change which instruction will be executed in this step.
- `preop`: An instruction has been selected and the `Vm` is about to execute it. This occurs just before step 3 above. This does not fire if the instruction pointer is out of range or the instruction has been patched out. Changing the instruction pointer in this listener will not change which instruction is invoked.
- `postop`: The `Vm` just finished executing an instruction. This will not fire if the instruction was patched out or execution was stopped before the event. The instruction pointer will still point at the instruction that was just executed, unless it was moved after the instruction was selected (by the instruction itself or a `preop` listener, for example).
- `poststep`: The `Vm` just finished executing a step. This will not fire if execution was stopped before the event. When this event fires, the instruction pointer points at the next instruction the `Vm` intends to invoke, although this can still be changed by moving the instruction pointer before the next `prestep` event fires.
- `output`: The `Vm` has produced an output value (provided as an argument).
- `blocked`: The `Vm` is blocked on input.
- `unblocked`: The `Vm` is no longer blocked on input.
- `terminated`: The `Vm` has terminated. If termination was the result of an `Error`, it will be provided as an argument. The `Error` will also be available in the `Vm`'s read-only `error` property. If no `terminated` event listener has been registered, the `Vm` will throw the `Error` instead, unless the `throwUnheardErrors` property is set to `false`.

## Instruction Pointer Incrementation

Just after the `prestep` event, the `Vm` will record the current position of the instruction pointer, then select the instruction it points at to be executed. After it executes, the default behavior is to increment the instruction pointer only if it remains unchanged from the value it had when it was recorded before the instruction was executed. If it has been changed (by the instruction or a `preop` or `postop` event listener, for example), it will be left as-is.

This behavior can be customized by setting the value of the `ipIncrement` property. The possible values are:

- `'always'`: Always increment the instruction pointer, even if it was changed.
- `'unchanged'`: Only increment the instruction pointer if it hasn't changed.
- `'never'`: Never increment the instruction pointer. It will only move if modified by an instruction or an event listener, for example.

## Input

The `enqueueInput()` method allows you to submit input to the program, which is queued until the program requests it. If the program requests input and the input queue is empty, it will temporarily halt. This is referred to as being "blocked on input." You may invoke `enqueueInput()` to unblock it, then invoke `run()` or `step()` to continue execution. Only integers are allowed as input values.

When writing operation implementations, you may retrieve queued input with the `readInput()` method. If no input is available, `readInput()` may return `undefined`; in this case, you should immediately exit the instruction and not move the instruction pointer.

## Output

Output can be retrieved from the `Vm` in two different ways:

- The `Vm` emits an `output` event each time output is produced; register a listener for this event to receive the output.
- Output is also automatically collected into a queue. You may interact with the queue with the following properties and methods:
  - `outputLength: number`: A read-only property that returns the number of values in the output queue.
  - `cloneOutput(): Array<number>`: Returns a copy of the output queue. The values remained enqueued.
  - `dequeueOutput(): number`: Dequeues and returns the next value in the output queue.
  - `dequeueAllOutput(): Array<number>`: Dequeues and returns all values in the output queue.

To emit output in your operation implementation, invoke the `output()` method. Only integers are valid output values.

## Patching

You can modify the `Vm`'s behavior by installing a patch. When the `Vm` reaches the offset where a patch has been installed, the patch will be executed instead of the instruction. To install a patch, invoke the `patch()` method on the `Vm`, passing in the offset where the patch should be installed, and a function that will be invoked instead of the patch. The patch function will receive a reference to the `Vm` object as an argument. Note that the `preop` and `postop` events are not fired when a patch is executed. The typical instruction pointer incrementation behavior still applies.
