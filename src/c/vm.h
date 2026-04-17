#ifndef __SRC_C_VM_H
#define __SRC_C_VM_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

typedef enum {
  STEP_RESULT_DONE,
  STEP_RESULT_CONTINUE,
  STEP_RESULT_SUSPEND,
} VmStepResult;

typedef enum {
  OP_NOP,
  OP_NUM,
  OP_STR,
  OP_STOR,
  OP_LOAD,
  OP_DUP,
  OP_JMP,
  OP_JMPF,
  OP_JMPT,
  OP_JMPA,
  OP_DEC,
  OP_INC,
  OP_SWP,
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
  OP_SIN,
  OP_COS,
  OP_AT2,
  OP_CAT,
  OP_SUBSTR,
  OP_SUBST,
  OP_FIND,
  OP_HAS,
  OP_LEN,
  OP_FMT,
  OP_PRINT,
  OP_CALL_FOREIGN,
  OP_TRUE,
  OP_FALS,
  OP_SUS,
  OP_EOF,
} VmOp;

typedef enum {
  TYPE_NIL,
  TYPE_NUM,
  TYPE_BOOL,
  TYPE_STRING,
  TYPE_PTR,
} VmType;

#define MAX_STACK 256
#define MAX_VARS 256

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

#define INT_AS_NUM(m_int) ((m_int) * VM_NUM_RATIO)
#define NUM_AS_INT(m_int) ((m_int) / VM_NUM_RATIO)

#define NUM_AS_FLOAT(m_num) ((m_num) / (float)VM_NUM_RATIO)
#define FLOAT_AS_NUM(m_float) (VmNum)((m_float) * VM_NUM_RATIO)
#define NUM_AS_DOUBL(m_num) ((m_num) / (double)VM_NUM_RATIO)
#define DOUBL_AS_NUM(m_float) (VmNum)((m_float) * VM_NUM_RATIO)
#define NUM_DEG_AS_PBL_ANGLE(m_deg)                                            \
  (m_deg) * (TRIG_MAX_ANGLE / VM_NUM_RATIO) / 360

#define READ_INSTRUCTION() (state->instructions[state->pc++])
#define PEEK_INSTRUCTION() (state->instructions[state->pc])
#define PUSH() (state->stack[++state->stack_ptr])
#define POP() (state->stack[state->stack_ptr--])
#define PEEK() (state->stack[state->stack_ptr])

#define COERCE_NUM(m_value) ((m_value).type == TYPE_NUM ? (m_value).num : 0)
#define COERCE_RAW(m_value) ((m_value).type == TYPE_NUM ? (m_value).num : 0)
#define COERCE_INT(m_value)                                                    \
  ((m_value).type == TYPE_NUM ? (m_value).num >> VM_NUM_RATIO_L2 : 0)
#define COERCE_STR(m_value) coerce_str(m_value)
#define COERCE_BOOL(m_value) coerce_bool(m_value)
#define COERCE_PTR(m_value) (m_value.ptr)

#define REF_STACK()                                                            \
  (state->stack[state->stack_ptr].string->refcount == (uint16_t)-1             \
       ? 0                                                                     \
       : ++state->stack[state->stack_ptr].string->refcount)

#define MAKE_STRING(m_name, m_char_ptr, m_length)                              \
  VmString *m_name = malloc(sizeof(VmString));                                 \
  do {                                                                         \
    m_name->refcount = 0;                                                      \
    {                                                                          \
      m_name->value = m_char_ptr;                                              \
      m_name->length = m_length;                                               \
    }                                                                          \
  } while (false)

/**
 * Fixed-point number with a ratio of 1/256
 */
typedef int32_t VmNum;

typedef struct {
  union {
    VmNum num;
    bool b;
    VmString *string;
    uint32_t var;
    uint32_t ptr;
  };
  VmType type;
} VmValue;

typedef union {
  VmOp op;
  int32_t num;
  uint32_t var;
  char ch[sizeof(int32_t)];
} VmInstruction;

typedef struct VmState VmState;

typedef void (*VmCallHandler)(VmState *state, int32_t call_id);

struct VmState {
  VmCallHandler call_handler;
  uint32_t pc;
  uint32_t stack_ptr;
  VmValue *vars;
  VmValue stack[MAX_STACK];
  VmInstruction *instructions;
};

VmString *coerce_str(VmValue value);

void cleanup_val(VmState *state, VmValue value);
void cleanup_val_str(VmState *state, VmString *value);
bool coerce_bool(VmValue value);

VmStepResult vm_step(VmState *state);
void vm_print_state(VmState *state);

#endif
