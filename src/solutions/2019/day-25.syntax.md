# Output Syntax

This document describes in detail the syntax of the output produced by the Intcode program for the Day 25 puzzle.

## Common Syntax

After a command is issued, the program will output a blank line, one or more sections of text, separated by blank lines, and finally a blank line again:

```txt
<blank>
<section 1>
<blank>
<section 2>
...
<blank>
```

Each section consists of one or more lines of text. If the droid is able to accept a new command, the last section will be `Command?`. Otherwise, the "game" is over.

## Lists

Command output may include a list. Each item in a list is on a separate line, and each line is prefixed with `'- '`.

### The giant electromagnet

The giant electromagnet is a unique item in that it doesn't kill you, and you are still prompted for commands, but it prevents you from being able to take any action. Instead, you get the following message:

```txt
The giant electromagnet is stuck to you.  You can't move!!
```

## `north`/`south`/`east`/`west`

### If direction is available

The output starts with two extra newline characters when entering a new room.

```txt
== <room name> ==
<description>

Doors here lead:
<list of directions>

Items here:
<list of items>

<weight check>
```

If no items are present, the items list section will be omitted.

The `weight check` section only appears if the droid has entered the room named "Pressure-Sensitive Floor". If the droid's weight is incorrect, the section will look like this:

```txt
A loud, robotic voice says "Alert! Droids on this ship are <weight> than the detected value!" and you are ejected back to the checkpoint.
```

The `weight` message will be either `'heavier'` or `'lighter'`. You will also be immediately taken back to the "Security Checkpoint" room.

If the droid's weight is correct, you get this message instead:

```txt
A loud, robotic voice says "Analysis complete! You may proceed." and you enter the cockpit.
Santa notices your small droid, looks puzzled for a moment, realizes what has happened, and radios your ship directly.
"Oh, hello! You should be able to get in by typing <code> on the keypad at the main airlock."
```

The `code` is the puzzle answer.

### If direction is not available

```txt
You can't go that way.
```

## `take <item>`

### If item is available

Taking an item can be fatal. Fatal items result in a `death` message being printed, and there will be no prompt for a new command. Note that two items stop the game without a death message:

- `giant electromagnet`: You'll get a `Command?` prompt, but will be unable to do anything.
- `infinite loop`: The Intcode program will loop without asking for input.

```txt
You take the <item>.

<death>
```

### If item is not available

```txt
You don't see that item here.
```

## `drop <item>`

### If item is held

```txt
You drop the <item>.
```

### If item is not held

```txt
You don't have that item.
```

## `inv`

### If you have items

```txt
Items in your inventory:
<list of items>
```

### If you don't have items

```txt
You aren't carrying any items.
```

## Anything Else

```txt
Unrecognized command.
```
