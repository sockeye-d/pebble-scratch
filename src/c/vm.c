#include "vm.h"

#include "trig.h"

#include <math.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#pragma GCC diagnostic ignored "-Wformat"

VmString *make_string_literal(char *value, size_t *read_length) {
  size_t length = strlen(value);
  *read_length = length + 1; // `read_length` includes the null terminator
  VmString *x = malloc(sizeof(VmString));
  x->length = length;
  x->refcount = -1;
  x->value = value;
  return x;
}

void string_unref(VmString *string) {
  if (string->refcount == (uint16_t)-1) {
    free(string);
    // String literal, don't free the value.
  } else if (--string->refcount == 0) {
    free(string->value);
    free(string);
  }
}

void string_ref(VmString *string) { ++string->refcount; }

void set_var(VmState *state, size_t var_ref, VmValue new_value) {
  VmValue old_value = state->vars[var_ref];
  if (old_value.type == TYPE_STRING) {
    string_unref(old_value.string);
  }
  if (new_value.type == TYPE_STRING) {
    string_ref(new_value.string);
  }
  state->vars[var_ref] = new_value;
}

void cleanup_val(VmState *state, VmValue value) {
  if (value.type == TYPE_STRING) {
    // Check to make sure this string isn't already stored in a variable.
    string_unref(value.string);
  }
}

#define VM_STRING_MINIMUM_ALLOC 4

VmString *string_fmt(char *fmt, ...) {
  size_t allocation_size = VM_STRING_MINIMUM_ALLOC;
  char *str = NULL;
  while (true) {
    str = malloc(sizeof(char) * allocation_size);

    va_list va_args;
    va_start(va_args, fmt);
    size_t written = vsnprintf(str, allocation_size, fmt, va_args);
    va_end(va_args);

    if (written <= allocation_size) {
      MAKE_STRING(r, str, written);
      return r;
    }
    free(str);
    // ~1.5×
    allocation_size += (allocation_size >> 1) + 1;
  }
}

VmString *string_cat(const char *a, const char *b) {
  size_t len_a = strlen(a);
  size_t len_b = strlen(b);
  char *str = malloc((len_a + len_b + 1) * sizeof(char));
  memcpy(str, a, len_a);
  memcpy(str + len_a, b, len_b);
  str[len_a + len_b] = '\0';
  MAKE_STRING(r, str, len_a + len_b);
  return r;
}

VmString *string_substring(const char *a, size_t start, size_t end) {
  if (end < start) {
    size_t temp = end;
    end = start;
    start = temp;
  }
  size_t len = strlen(a);
  if (start >= len) {
    start = len - 1;
  }
  if (end >= len) {
    end = len - 1;
  }
  size_t size = end - start;
  char *str = malloc((size + 1) * sizeof(char));
  memcpy(str, a + start, size);
  str[size] = '\0';
  MAKE_STRING(r, str, size);
  return r;
}

VmString *string_substitute(const char *string, const char *what,
                            const char *with) {
#define GROW_STRING(m_needed_len)                                              \
  do {                                                                         \
    while (m_needed_len > allocated_len) {                                     \
      allocated_len += (allocated_len >> 1) + 1;                               \
      /* +1 because of null terminator. There's better ways around it but this \
       * is easier */                                                          \
      str = realloc(str, allocated_len + 1);                                   \
    }                                                                          \
  } while (false)

  size_t string_len = strlen(string);
  size_t what_len = strlen(what);
  size_t with_len = strlen(with);
  size_t allocated_len = string_len;
  char *str = malloc(string_len);
  size_t str_i = 0;
  for (size_t i = 0; i < string_len; i++) {
    bool found_match = true;
    size_t j = i;
    size_t what_i = 0;
    while (true) {
      char a = string[j++];
      char b = what[what_i++];
      if (a != b) {
        found_match = false;
        break;
      }
      if (what_i >= what_len) {
        break;
      }
      if (j >= string_len) {
        found_match = false;
        break;
      }
    }
    if (found_match) {
      GROW_STRING(str_i + with_len);
      // String is now guaranteed to have enough space to insert `with` into.
      for (size_t k = 0; k < with_len; k++) {
        str[str_i++] = with[k];
      }
      i += what_len - 1;
    } else {
      GROW_STRING(str_i + 1);
      // String is now guaranteed to have enough space to insert one more
      // character into.
      str[str_i++] = string[i];
    }
  }
  str[str_i] = '\0';
  MAKE_STRING(r, str, str_i);
  return r;
#undef GROW_STRING
}

size_t string_find(const char *string, const char *subject) {
  size_t len = strlen(string);
  size_t subject_len = strlen(subject);
  if (subject_len == 0) {
    return -1;
  }
  for (size_t i = 0; i < len - subject_len; i++) {
    for (size_t j = 0; j < subject_len; j++) {
      if (string[i + j] != subject[j]) {
        goto outer;
      }
    }
    return i;
  outer: {}
  }
  return (size_t)-1;
}

const VmString string_true = (VmString){
    .refcount = (uint16_t)-1,
    .length = 4,
    .value = "true",
};

const VmString string_false = (VmString){
    .refcount = (uint16_t)-1,
    .length = 5,
    .value = "false",
};

static inline __attribute__((__always_inline__)) VmString *
coerce_str(VmValue value) {
  if (value.type == TYPE_STRING) {
    return value.string;
  }
  if (value.type == TYPE_BOOL) {
    // this cast is probably fine
    return value.b ? (VmString *)&string_true : (VmString *)&string_false;
  }
  return string_fmt("%.2f", NUM_AS_FLOAT(value.num));
}

static inline __attribute__((__always_inline__)) bool
coerce_bool(VmValue value) {
  if (value.type == TYPE_BOOL) {
    return value.b != 0;
  }
  if (value.type == TYPE_NUM) {
    return value.num != 0;
  }
  if (value.type == TYPE_STRING) {
    return strcmp(string_true.value, value.string->value);
  }
  return false;
}

int val_cmp(VmValue a, VmValue b) {
  if (a.type == TYPE_STRING && b.type != TYPE_STRING) {
    VmString *str_b = COERCE_STR(b);
    int result = strcmp(a.string->value, str_b->value);
    string_unref(str_b);
    return result;
  }
  if (a.type != TYPE_STRING && b.type == TYPE_STRING) {
    VmString *str_a = COERCE_STR(a);
    int result = strcmp(str_a->value, b.string->value);
    string_unref(str_a);
    return result;
  }
  if (a.type == TYPE_STRING && b.type == TYPE_STRING) {
    return strcmp(a.string->value, b.string->value);
  }
  if (a.num < b.num) {
    return -1;
  }
  if (a.num > b.num) {
    return 1;
  }
  return 0;
}

/**
 * Binary operation
 */
#define BINARY_OPR(...)                                                        \
  do {                                                                         \
    VmValue a = POP();                                                         \
    VmValue b = POP();                                                         \
    VmValue result = (__VA_ARGS__);                                            \
    PUSH() = result;                                                           \
    cleanup_val(state, a);                                                     \
    cleanup_val(state, b);                                                     \
  } while (false)

/**
 * Binary number operation
 */
#define BINARY_N_OPR(m_operation)                                              \
  do {                                                                         \
    VmValue _a = POP();                                                        \
    VmValue _b = POP();                                                        \
    VmNum a = COERCE_NUM(_a);                                                  \
    VmNum b = COERCE_NUM(_b);                                                  \
    VmNum result = (m_operation);                                              \
    PUSH() = (VmValue){.type = TYPE_NUM, .num = result};                       \
    cleanup_val(state, _a);                                                    \
    cleanup_val(state, _b);                                                    \
  } while (false)

/**
 * Binary boolean operation
 */
#define BINARY_B_OPR(m_operation)                                              \
  do {                                                                         \
    VmValue _a = POP();                                                        \
    VmValue _b = POP();                                                        \
    bool a = COERCE_BOOL(_a);                                                  \
    bool b = COERCE_BOOL(_b);                                                  \
    PUSH() = (VmValue){.type = TYPE_BOOL, .b = m_operation};                   \
    cleanup_val(state, _a);                                                    \
    cleanup_val(state, _b);                                                    \
  } while (false)

/**
 * Binary number to boolean operation
 */
#define BINARY_NB_OPR(m_operation)                                             \
  do {                                                                         \
    VmValue _a = POP();                                                        \
    VmValue _b = POP();                                                        \
    VmNum a = COERCE_NUM(_a);                                                  \
    VmNum b = COERCE_NUM(_b);                                                  \
    PUSH() = (VmValue){.type = TYPE_BOOL, .b = m_operation};                   \
    cleanup_val(state, _a);                                                    \
    cleanup_val(state, _b);                                                    \
  } while (false)

VmStepResult vm_step(VmState *state) {
  VmInstruction op = READ_INSTRUCTION();
  switch (op.op) {
  case OP_NOP: {
  } break;
  case OP_NUM: {
    PUSH() = (VmValue){.type = TYPE_NUM, .num = READ_INSTRUCTION().num};
  } break;
  case OP_STR: {
    size_t string_length;
    VmString *literal = make_string_literal(
        (char *)&state->instructions[state->pc], &string_length);
    // Increment program counter by the length of the string divided by the
    // number of chars per instruction, rounded up.
    state->pc += (string_length + sizeof(size_t) - 1) / sizeof(size_t);
    PUSH() = (VmValue){.type = TYPE_STRING, .string = literal};
    REF_STACK();
  } break;
  case OP_STOR: {
    int32_t var_ref = READ_INSTRUCTION().var;
    VmValue a = POP();
    set_var(state, var_ref, a);
    cleanup_val(state, a);
  } break;
  case OP_LOAD: {
    int32_t var_ref = READ_INSTRUCTION().var;
    VmValue var = state->vars[var_ref];
    PUSH() = var;
    if (var.type == TYPE_STRING) {
      REF_STACK();
    }
  } break;
  case OP_DUP: {
    uint32_t c = READ_INSTRUCTION().var - 1;
    uint32_t starting_stack_ptr = state->stack_ptr;
    for (uint32_t stack_i = 0; stack_i <= c; stack_i++) {
      uint32_t stack_ptr = starting_stack_ptr - c + stack_i;
      VmValue val = state->stack[stack_ptr];
      PUSH() = val;
      if (val.type == TYPE_STRING) {
        REF_STACK();
      }
    }
  } break;
  case OP_JMP: {
    int32_t jmp_delta = READ_INSTRUCTION().var;
    state->pc += jmp_delta;
  } break;
  case OP_JMPF: {
    VmValue a = POP();
    int32_t jmp_delta = READ_INSTRUCTION().var;
    if (!COERCE_BOOL(a)) {
      state->pc += jmp_delta;
    }
    cleanup_val(state, a);
  } break;
  case OP_JMPT: {
    VmValue a = POP();
    int32_t jmp_delta = READ_INSTRUCTION().var;
    if (COERCE_BOOL(a)) {
      state->pc += jmp_delta;
    }
    cleanup_val(state, a);
  } break;
  case OP_JMPA: {
    VmValue a = POP();
    int32_t ptr = COERCE_PTR(a);
    state->pc = ptr;
    cleanup_val(state, a);
  } break;
  case OP_DEC:
  case OP_INC: {
    int32_t offset = VM_NUM_RATIO;
    if (op.op == OP_DEC) {
      offset = -offset;
    }
    VmValue a = PEEK();
    VmNum num = COERCE_NUM(a);
    state->stack[state->stack_ptr] = (VmValue){
        .type = TYPE_NUM,
        .num = num + offset,
    };
    cleanup_val(state, a);
  } break;
  case OP_SWP: {
    VmValue top = state->stack[state->stack_ptr];
    state->stack[state->stack_ptr] = state->stack[state->stack_ptr - 1];
    state->stack[state->stack_ptr - 1] = top;
  } break;
  case OP_ADD: {
    BINARY_N_OPR(a + b);
  } break;
  case OP_SUB: {
    BINARY_N_OPR(a - b);
  } break;
  case OP_MUL: {
    BINARY_N_OPR((a * b) >> VM_NUM_RATIO_L2);
  } break;
  case OP_DIV: {
    BINARY_N_OPR((a << VM_NUM_RATIO_L2) / b);
  } break;
  case OP_MOD: {
    BINARY_N_OPR(a % b);
  } break;
  case OP_NEQ: {
    BINARY_OPR((VmValue){.type = TYPE_BOOL, .b = val_cmp(a, b) != 0});
  } break;
  case OP_EQ: {
    BINARY_OPR((VmValue){.type = TYPE_BOOL, .b = val_cmp(a, b) == 0});
  } break;
  case OP_LT: {
    BINARY_OPR((VmValue){.type = TYPE_BOOL, .b = val_cmp(a, b) < 0});
  } break;
  case OP_LTE: {
    BINARY_OPR((VmValue){.type = TYPE_BOOL, .b = val_cmp(a, b) <= 0});
  } break;
  case OP_GT: {
    BINARY_OPR((VmValue){.type = TYPE_BOOL, .b = val_cmp(a, b) > 0});
  } break;
  case OP_GTE: {
    BINARY_OPR((VmValue){.type = TYPE_BOOL, .b = val_cmp(a, b) >= 0});
  } break;
  case OP_AND: {
    BINARY_B_OPR(a && b);
  } break;
  case OP_OR: {
    BINARY_B_OPR(a || b);
  } break;
  case OP_NOT: {
    VmValue _a = POP();
    bool a = COERCE_BOOL(_a);
    PUSH() = (VmValue){.type = TYPE_NUM, .num = !a ? 1 : 0};
    cleanup_val(state, _a);
  } break;
  case OP_SQRT: {
    VmValue _a = POP();
    float a = NUM_AS_FLOAT(COERCE_NUM(_a));
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = FLOAT_AS_NUM(sqrtf(a)),
    };
    cleanup_val(state, _a);
  } break;
  case OP_ABS: {
    VmValue _a = POP();
    VmNum a = COERCE_NUM(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = abs(a),
    };
    cleanup_val(state, _a);
  } break;
  case OP_NEG: {
    VmValue _a = POP();
    VmNum a = COERCE_NUM(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = -a,
    };
    cleanup_val(state, _a);
  } break;
  case OP_LOG2: {
    VmValue _a = POP();
    double a = NUM_AS_DOUBL(COERCE_NUM(_a));
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = DOUBL_AS_NUM(log2(a)),
    };
    cleanup_val(state, _a);
  } break;
  case OP_POW2: {
    VmValue _a = POP();
    double a = NUM_AS_DOUBL(COERCE_NUM(_a));
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = DOUBL_AS_NUM(pow(2.0, a)),
    };
    cleanup_val(state, _a);
  } break;
  case OP_MIN: {
    BINARY_N_OPR(a < b ? a : b);
  } break;
  case OP_MAX: {
    BINARY_N_OPR(a > b ? a : b);
  } break;
  case OP_CLAMP: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmValue _c = POP();
    VmNum a = COERCE_NUM(_a);
    VmNum min = COERCE_NUM(_b);
    VmNum max = COERCE_NUM(_c);
    PUSH() =
        (VmValue){.type = TYPE_NUM, .num = a < min ? min : (a > max ? max : a)};
    cleanup_val(state, _a);
    cleanup_val(state, _b);
    cleanup_val(state, _c);
  } break;
  case OP_ROND: {
    VmValue _a = POP();
    VmNum a = COERCE_NUM(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = (a + VM_NUM_RATIO / 2) >> VM_NUM_RATIO_L2 << VM_NUM_RATIO_L2,
    };
    cleanup_val(state, _a);
  } break;
  case OP_FLOR: {
    VmValue _a = POP();
    VmNum a = COERCE_NUM(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = a >> VM_NUM_RATIO_L2 << VM_NUM_RATIO_L2,
    };
    cleanup_val(state, _a);
  } break;
  case OP_CEIL: {
    VmValue _a = POP();
    VmNum a = COERCE_NUM(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = (a + VM_NUM_RATIO - 1) >> VM_NUM_RATIO_L2 << VM_NUM_RATIO_L2,
    };
    cleanup_val(state, _a);
  } break;
  case OP_SIN: {
    VmValue _a = POP();
    VmNum a = COERCE_NUM(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = sin_lookup(a / 360 * (TRIG_MAX_ANGLE / VM_NUM_RATIO)) *
               VM_NUM_RATIO / TRIG_MAX_RATIO,
    };
    cleanup_val(state, _a);
  } break;
  case OP_COS: {
    VmValue _a = POP();
    VmNum a = COERCE_NUM(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = cos_lookup(a / 360 * (TRIG_MAX_ANGLE / VM_NUM_RATIO)) *
               VM_NUM_RATIO / TRIG_MAX_RATIO,
    };
    cleanup_val(state, _a);
  } break;
  case OP_AT2: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmNum x = COERCE_NUM(_a);
    VmNum y = COERCE_NUM(_b);
    // atan2_lookup accepts 16-bit values, so if the numbers are larger than
    // that, shift them down so that they aren't.
    while (x >= 32768 || y >= 32768) {
      x >>= 1;
      y >>= 1;
    }
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = atan2_lookup(y, x) * VM_NUM_RATIO * 360 / TRIG_MAX_RATIO,
    };
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_CAT: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmString *a = COERCE_STR(_a);
    VmString *b = COERCE_STR(_b);
    PUSH() = (VmValue){.type = TYPE_STRING,
                       .string = string_cat(a->value, b->value)};
    REF_STACK();
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_SUBSTR: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmValue _c = POP();
    VmString *str = COERCE_STR(_a);
    int32_t start = COERCE_INT(_b);
    int32_t end = COERCE_INT(_c);
    PUSH() = (VmValue){
        .type = TYPE_STRING,
        .string = string_substring(str->value, start, end),
    };
    REF_STACK();
    cleanup_val(state, _a);
    cleanup_val(state, _b);
    cleanup_val(state, _c);
  } break;
  case OP_SUBST: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmValue _c = POP();
    VmString *str = COERCE_STR(_a);
    VmString *what = COERCE_STR(_b);
    VmString *with = COERCE_STR(_c);
    PUSH() = (VmValue){
        .type = TYPE_STRING,
        .string = string_substitute(str->value, what->value, with->value),
    };
    REF_STACK();
    cleanup_val(state, _a);
    cleanup_val(state, _b);
    cleanup_val(state, _c);
  } break;
  case OP_FIND: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmString *str = COERCE_STR(_a);
    VmString *subject = COERCE_STR(_b);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = string_find(str->value, subject->value) << VM_NUM_RATIO_L2,
    };
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_HAS: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmString *str = COERCE_STR(_a);
    VmString *subject = COERCE_STR(_b);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = string_find(str->value, subject->value) != (size_t)-1 ? 1 : 0,
    };
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_LEN: {
    VmValue _a = POP();
    VmString *str = COERCE_STR(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = strlen(str->value) << VM_NUM_RATIO_L2,
    };
    cleanup_val(state, _a);
  } break;
  case OP_FMT: {
    VmValue _a = POP();
    VmValue _b = POP();
    double num = NUM_AS_DOUBL(COERCE_NUM(_a));
    int32_t decimal_places = COERCE_INT(_b);
    PUSH() = (VmValue){
        .type = TYPE_STRING,
        .string = string_fmt("%.*f", decimal_places, num),
    };
    REF_STACK();
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_PRINT: {
    VmValue _a = POP();
    VmString *str = COERCE_STR(_a);
    printf("%s\n", str->value);
    cleanup_val(state, _a);
  } break;
  case OP_CALL_FOREIGN: {
    size_t call_id = READ_INSTRUCTION().var;
    VmCallHandler handler = state->call_handler;
    if (handler != NULL) {
      handler(state, call_id);
    }
  } break;
  case OP_TRUE: {
    PUSH() = (VmValue){
        .type = TYPE_BOOL,
        .b = true,
    };
  } break;
  case OP_FALS: {
    PUSH() = (VmValue){
        .type = TYPE_BOOL,
        .b = false,
    };
  } break;
  case OP_SUS:
    return STEP_RESULT_SUSPEND;
  case OP_EOF:
    return STEP_RESULT_DONE;
  }
  return STEP_RESULT_CONTINUE;
}

void print_value(VmValue value) {
  switch (value.type) {
  case TYPE_NIL: {
    printf("TYPE_NIL");
  } break;
  case TYPE_NUM: {
    printf("TYPE_NUM=%.2f", NUM_AS_DOUBL(value.num));
  } break;
  case TYPE_BOOL: {
    if (value.b) {
      printf("TYPE_BOOL=true");
    } else {
      printf("TYPE_BOOL=false");
    }
  } break;
  case TYPE_STRING: {
    uint16_t refcount = value.string->refcount;
    if (refcount == (uint16_t)-1) {
      printf("TYPE_STRING=%s, refcount=literal,", value.string->value);
    } else {
      printf("TYPE_STRING=%s, refcount=%u,", value.string->value, refcount);
    }
  } break;
  case TYPE_PTR: {
    printf("TYPE_PTR=%u", value.ptr);
  } break;
  }
}

const char *print_instruction(VmInstruction instruction) {
  switch (instruction.op) {
  case OP_NOP:
    return "OP_NOP";
  case OP_NUM:
    return "OP_NUM";
  case OP_STR:
    return "OP_STR";
  case OP_STOR:
    return "OP_STOR";
  case OP_LOAD:
    return "OP_LOAD";
  case OP_DUP:
    return "OP_DUP";
  case OP_JMP:
    return "OP_JMP";
  case OP_JMPF:
    return "OP_JMPF";
  case OP_JMPT:
    return "OP_JMPT";
  case OP_DEC:
    return "OP_DEC";
  case OP_INC:
    return "OP_INC";
  case OP_SWP:
    return "OP_SWP";
  case OP_JMPA:
    return "OP_JMPA";
  case OP_ADD:
    return "OP_ADD";
  case OP_SUB:
    return "OP_SUB";
  case OP_MUL:
    return "OP_MUL";
  case OP_DIV:
    return "OP_DIV";
  case OP_MOD:
    return "OP_MOD";
  case OP_NEQ:
    return "OP_NEQ";
  case OP_EQ:
    return "OP_EQ";
  case OP_LT:
    return "OP_LT";
  case OP_LTE:
    return "OP_LTE";
  case OP_GT:
    return "OP_GT";
  case OP_GTE:
    return "OP_GTE";
  case OP_AND:
    return "OP_AND";
  case OP_OR:
    return "OP_OR";
  case OP_NOT:
    return "OP_NOT";
  case OP_SQRT:
    return "OP_SQRT";
  case OP_ABS:
    return "OP_ABS";
  case OP_NEG:
    return "OP_NEG";
  case OP_LOG2:
    return "OP_LOG2";
  case OP_POW2:
    return "OP_POW2";
  case OP_MIN:
    return "OP_MIN";
  case OP_MAX:
    return "OP_MAX";
  case OP_CLAMP:
    return "OP_CLAMP";
  case OP_ROND:
    return "OP_ROND";
  case OP_FLOR:
    return "OP_FLOR";
  case OP_CEIL:
    return "OP_CEIL";
  case OP_SIN:
    return "OP_SIN";
  case OP_COS:
    return "OP_COS";
  case OP_AT2:
    return "OP_AT2";
  case OP_CAT:
    return "OP_CAT";
  case OP_SUBSTR:
    return "OP_SUBSTR";
  case OP_SUBST:
    return "OP_SUBST";
  case OP_FIND:
    return "OP_FIND";
  case OP_HAS:
    return "OP_HAS";
  case OP_LEN:
    return "OP_LEN";
  case OP_FMT:
    return "OP_FMT";
  case OP_PRINT:
    return "OP_PRINT";
  case OP_CALL_FOREIGN:
    return "OP_CALL";
  case OP_TRUE:
    return "OP_TRUE";
  case OP_FALS:
    return "OP_FALS";
  case OP_SUS:
    return "OP_SUS";
  case OP_EOF:
    return "OP_EOF";
  }
  return "OP_UNKNOWN";
}

void vm_print_state(VmState *state) {
  printf("PC = %u\nsp = %d\n", state->pc, (int32_t)state->stack_ptr);
  if (state->stack_ptr == (uint32_t)-1) {
    printf("no stack yet\n");
  } else {
    for (uint32_t i = 0; i <= state->stack_ptr; i++) {
      if (i >= MAX_STACK) {
        printf("Stack overflow!\n");
        break;
      }
      printf("%d = ", i);
      print_value(state->stack[i]);
      printf("\n");
    }
  }
  int32_t var_i = -1;
  VmValue var;
  while (var_i < MAX_VARS && (var = state->vars[++var_i]).type != TYPE_NIL) {
    printf("var %d = ", var_i);
    print_value(var);
    printf("\n");
  }
  printf("next instruction = %s\n", print_instruction(PEEK_INSTRUCTION()));
  printf("-----\n");
}
