#ifndef __SRC_C_VM_H
#define __SRC_C_VM_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#pragma once

typedef enum {
  OP_NOP,
  OP_NUM,
  OP_STR,
  OP_STOR,
  OP_LOAD,
  OP_JMP,
  OP_JMPF,
  OP_JMPT,
  OP_ADD,
  OP_SUB,
  OP_MUL,
  OP_DIV,
  OP_MOD,
  OP_NEQ,
  OP_EQ,
  OP_LT,
  OP_LTE,
  OP_GT,
  OP_GTE,
  OP_AND,
  OP_OR,
  OP_NOT,
  OP_SQRT,
  OP_ABS,
  OP_NEG,
  OP_LOG2,
  OP_POW2,
  OP_MIN,
  OP_MAX,
  OP_CLAMP,
  OP_ROND,
  OP_FLOR,
  OP_CEIL,
  OP_CAT,
  OP_SUBSTR,
  OP_SUBST,
  OP_FIND,
  OP_HAS,
  OP_LEN,
  OP_FMT,
  OP_PRINT,
  OP_EOF,
} VmOp;

typedef enum {
  TYPE_NIL,
  TYPE_NUM,
  TYPE_BOOL,
  TYPE_STRING,
} VmType;

#define MAX_STACK 1024
#define MAX_VARS 1024

typedef struct {
  size_t length;
  uint16_t refcount; // Max refcount is MAX_STACK + MAX_VARS = 2048
  /**
   * Still null-terminated despite being length+value for easy interop
   */
  char *value;
} VmString;

#define VM_NUM_RATIO_L2 8 // Yields a resolution of about 0.004
#define VM_NUM_RATIO (1 << VM_NUM_RATIO_L2)

/**
 * Fixed-point number with a ratio of 1/256
 */
typedef int32_t VmNum;

typedef struct {
  union {
    VmNum num;
    bool b;
    VmString *string;
    int32_t var;
  };
  VmType type;
} VmValue;

typedef union {
  VmOp op;
  int32_t num;
  size_t var;
  char ch[sizeof(size_t)];
} VmInstruction;

typedef struct {
  size_t pc;
  size_t stack_ptr;
  VmValue vars[MAX_VARS];
  VmValue stack[MAX_STACK];
  VmInstruction *instructions;
} VmState;

bool vm_step(VmState *state);
void vm_print_state(VmState *state);

#endif
