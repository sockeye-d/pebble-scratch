#!/usr/bin/sh
clang test/*.c src/c/vm.c /usr/lib/libcunit.so "$@" -lm -o test_exe
