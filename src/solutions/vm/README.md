# The `Vm` Class

This class lets you define and build a simple virtual machine that executes programs written in a customized machine language. You can programmatically declare the registers and operations the `Vm` supports, and you can extend the class to create additional functionality.

## Classes and Interfaces

- `Vm`: This class represents the entire virtual machine and has methods for controlling it.
- `Parser`: An interface for objects which can parse source code into instructions. Its `parse()` method is expected to accept the source code and return an instance of `Program`.
- `DefaultParser`: The default implementation of the `Parser` interface. See the **Default Implementation** section below for details.
- `Program`: An interface which represents the code being executed. Can execute any single instruction given its offset.
- `DefaultProgram`: The default implementation of `Program` which will be used when another is not provided. See the **Default Implementation** section below for details.

Since JavaScript does not have the explicit concept of an interface, they are implemented as classes whose methods throw `Error`s. When you extend these interfaces, you must override the methods with your own implementations.

## Basic Usage

The basic steps for using a `Vm` is as follows:

1. Instantiate the `Vm`.
2. `load()` the source code.
3. Declare any needed registers.
4. Declare opcodes.
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

By default, attempting to use an unknown register results in an `Error`. This is to help you detect typos in your register names. You must declare any registers that you use other than `ip`. You do this by passing their names into the `declareRegisters()` method. The instruction pointer register need not be included in the list of registers you provide to this method. Unlike `declareIp()`, invoking it multiple times does not remove any previously-declared registers. A newly-declared register starts with a value of `0`.

Alternatively, you may set the `lazyRegisters` property to `true`. Doing so makes it so that if an attempt is made to read or write to a register that does not exist, it will be automatically provisioned immediately. This may be desirable if you don't know what registers will be used in advance, but you lose the ability to detect typos in register names.

There are several other methods for working with registers:

- `hasRegister(string)`: Checks whether a register exists. (Does not trigger automatic creation under lazy registers mode.)
- `getRegister(string)`: Returns a register's current value.
- `setRegister(string, number)`: Sets a register's value.
- `addRegister(string, number)`: Adds a value to a register's existing value.
- `exportRegisters()`: Returns the current state of the registers as a plain object.

## Execution

Execute your program by invoking `run()`. This will cause the `Vm` to execute instructions until one of the following occurs:

- The program terminates normally.
- An error occurs.
- The VM becomes blocked on input. (See the **Input** section below.)
- An operation or listener invokes `halt()`.

Alternatevly, you may step through the program one instruction at a time by calling `step()`. Each time you call `step()`, one instruction will be executed, then the program will halt, allowing you to inspect its state before continuing by calling `step()` or `run()`.

While the VM is running, you may invoke `halt()` or `terminate()` to stop execution. The difference between the two is:

- The `halt()` method stops execution temporarily, meaning you can resume right where you left off by calling `step()` or `run()`. The `terminate()` method stops execution permanently, requiring you to `reset()` the VM's state and start over before you can run it again.
- You may optionally pass an `Error` into `terminate()`.

The `state` property is a string that describes the current execution state of the `Vm`:

- `'ready'`: The `Vm` is ready to execute instructions. You may invoke `step()` or `run()` to proceed.
- `'running'`: The `Vm` is currently executing instructions. You may invoke `halt()` or `terminate()` to stop.
- `'blocked'`: The `Vm` is blocked on input. You must invoke `enqueueInput()`, which will change the state to `'ready'`.
- `'terminated'`: The `Vm` has ended (possibly with an error).

## Events

The `Vm` class extends `EventEmitter`. These are the events which it can emit during execution:

- `prestep`: The `Vm` is about to execute an step. The instruction to be executed has not been selected yet, so this listener can modify the instruction pointer to change which instruction will be executed.
- `preop`: An instruction has been selected and the `Vm` is about to execute it. This does not fire if the instruction pointer is out of range or the instruction has been patched out. Changing the instruction pointer in this listener will not change which instruction is invoked.
- `postop`: The `Vm`  just finished executing an instruction. This will not fire if the instruction threw an `Error`. The instruction pointer will still point at the instruction that was just executed, unless it was moved after the instruction was selected (by the instruction itself or a `preop` listener, for example).
- `poststep`: The `Vm` just finished executing a step. This will not fire if the instruction threw an `Error`. When this event fires, the instruction pointer points at the next instruction the `Vm` intends to invoke, although this can still be changed by moving the instruction pointer before the next `prestep` event fires.
- `output`: The `Vm` has produced an output value (provided as an argument).
- `blocked`: The `Vm` is blocked on input.
- `unblocked`: The `Vm` is no longer blocked on input.
- `terminated`: The `Vm` has terminated. If termination was the result of an `Error`, it will be provided as an argument. The `Error` will also be available in the `Vm`'s read-only `error` property. If no `terminated` event listener has been registered, the `Vm` will throw the `Error` instead, unless the `throwUnheardErrors` property is set to `false`.

Use the standard `EventEmitter` methods to subscribe to these events.

## Instruction Pointer Incrementation

Just after the `prestep` event, the `Vm` will record the current position of the instruction pointer, then select the instruction it points at to be executed. After it executes, the default behavior is to increment the instruction pointer only if it remains unchanged from the value it had when it was recorded before the instruction was executed. If it has been changed (by the instruction or a `preop` or `postop` event listener, for example), it will be left as-is.

This behavior can be customized by setting the value of the `ipIncrement` property. The possible values are:

- `'always'`: Always increment the instruction pointer, even if it was changed.
- `'unchanged'`: Only increment the instruction pointer if it hasn't changed.
- `'never'`: Never increment the instruction pointer. It will only move if modified by an instruction or an event listener, for example.

## Input

The `enqueueInput()` method allows you to submit input to the program, which is queued until the program requests it. If the program requests input and the input queue is empty, it will stop executing. This is referred to as being "blocked on input." You may invoke `enqueueInput()` to unblock it, then invoke `run()` or `step()` to continue execution. Only integers are allowed as input values.

When writing operation implementations, you may retrieve queued input with the `readInput()` method. If no input is available, `readInput()` may return `undefined`; in this case, you should immediately exit the instruction and not move in instruction pointer.

## Output

Output can be retrieved from the `Vm` in two different ways:

- The `Vm` emits an `output` event each time output is produced; register a listener for this event to receive the output.
- Output is also automatically collected into a queue. You may interact with the queue with the following properties and methods:
  - `outputLength` (`number`): A read-only property that returns the number of values in the output queue.
  - `cloneOutput()` (`Array<number>`): Returns a copy of the output queue. The values remained enqueued.
  - `dequeueOutput()` (`number`): Dequeues and returns the next value in the output queue.
  - `dequeueAllOutput()` (`Array<number>`): Dequeues and returns all values in the output queue.

To emit output in your operation implementation, invoke the `output()` method. Only integers are valid output values.

## `Parser`

A `Parser` is responsible for converting source code into a `Program` instance. The `parser` property on the `Vm` is set to the `Parser` instance that will be used by the `Vm` to parse your program. By default, this will be an instance of `DefaultParser`. To use your own parser, do the
following:

1. Write a class that extends `Parser`.
2. Implement the `parse()` method. Return an instance of a `Program` subclass.
3. Set the `parser` property of the `Vm` to an instance of your new `Parser` subclass.

## `Program`

The `Program` interface is for objects that are responsible for actually executing the instruction at any given offset. `DefaultParser` returns a `DefaultProgram` instance when parsing the source code. You may provide your own `Program` subclass and write a custom `Parser` to return it.

## Default Parsing and Execution Behavior

The `DefaultParser` expects the source to be a mutli-line string, where each line represents an instruction. (Windows line endings are automatically converted to newlines.) The line starts with an opcode token, which identifies the operation to perform. The instruction may also have arguments; if they are present, they come after the opcode token, with a separator between them (a space by default). There are also separaters between the arguments (also a space by default).

Before parsing, opcodes must be registered by invoking `DefaultParser.opcode()`. This is how you provide the behavior for each opcode. If an unknown opcode is encountered, an error will be thrown.

The `opcode()` method expects two arguments: the opcode to register, and a function implementing that operation. The implementation function will receive to arguments when invoked: a reference to the `Vm` instance, and an array of the arguments for the instruction. Each argument is either an integer or a string naming a register. (An argument token will be considered an integer if it matches the `RegExp` `/^[+-]?\d+$/`). If the parser encounters an unknown register name, it will throw an `Error`. The `Vm.eval()` method will automatically coerce arguments to their actual values for you.

Execution terminates either when you invoke `terminate()`, or the instruction pointer moves outside the list of instructions. If you pass an `Error` into `terminate()`, the `Vm`'s `error` property will be set to that `Error`. If there are no `terminated` event listeners, the `Error` will also be thrown.

## Tracing

You can cause debugging messages to be output by using the tracing feature. Tracing is off by default; to activate tracing, invoke `setTrace()` to a `stream.Writable` where you want the tracing messages written. To output a trace message, pass it to `trace()`.
