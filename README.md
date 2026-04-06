# pebble-scratch

## VM spec

Bytecode instructions (load = load one value from memory):

| Name   | Operation                                        |
| ------ | ------------------------------------------------ |
| nop    | Does nothing                                     |
| num    | Pushes a number to the stack                     |
| str    | Pushes a string's pointer to the stack           |
| stor   | store(var_ref=read, value=pop)                   |
| load   | push(load(var_ref=read))                         |
| jmp    | PC += read                                       |
| jmpf   | if (pop == fals) PC += read                      |
| jmpt   | if (pop == true) PC += read                      |
| add    | push (pop + pop)                                 |
| sub    | push (pop - pop)                                 |
| mul    | push (pop \* pop)                                |
| div    | push (pop / pop)                                 |
| mod    | push (pop % pop)                                 |
| neq    | push (pop == pop)                                |
| eq     | push (pop != pop)                                |
| lt     | push (pop < pop)                                 |
| lte    | push (pop <= pop)                                |
| gt     | push (pop > pop)                                 |
| gte    | push (pop >= pop)                                |
| and    | push (pop & pop)                                 |
| or     | push (pop \| pop)                                |
| not    | push (~pop)                                      |
| sqrt   | push(√pop)                                       |
| abs    | push(abs(pop))                                   |
| neg    | push(negate(pop))                                |
| log2   | push(log2(pop))                                  |
| pow2   | push(2^(pop))                                    |
| min    | push(min(pop, pop))                              |
| max    | push(max(pop, pop))                              |
| clamp  | push(clamp(value=pop, min=pop, max=pop))         |
| flor   | push(floor(pop))                                 |
| ceil   | push(ceil(pop))                                  |
| cat    | push(concat(pop, pop))                           |
| substr | push(substring(string=pop, start=pop, end=pop))  |
| subst  | push(substitute(string=pop, what=pop, with=pop)) |
| find   | push(find(string=pop, what=pop))                 |
| has    | push(contains(string=pop, what=pop))             |
| len    | push(strlen(pop))                                |
| fmt    | push(format(num=pop, decimal_places=pop))        |
| eof    | Signifies the end of the memory stream           |

```kt
var v = 5 + 10;
v = v;
```

to

```bash
num 655360 # 2560 * 256
num 327680 # 5  * 256
add
stor 0 # store(var_ref=0, value=15)
load 0
stor 0
```

```kt
5 + 10 > 5 - 10
```

to

```bash
num 10 × 256
num  5 × 256
sub
num 10 × 256
num  5 × 256
add
gt
```

Numbers are fixed-point at a ratio of 256 (1 << 8), steps of 0.004
Binary digits are represented as numbers, `0b0` (0) and `0b1` (0.004)
