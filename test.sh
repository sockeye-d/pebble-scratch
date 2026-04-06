#!/usr/bin/sh

clang test.c -lm -o test
./test
rm -f test
