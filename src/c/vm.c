#include "vm.h"

#include <math.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define READ_INSTRUCTION() (state->instructions[state->pc++])
#define PUSH() (state->stack[++state->stack_ptr])
#define POP() (state->stack[state->stack_ptr--])

#define COERCE_NUM(m_value) ((m_value).type == TYPE_NUM ? (m_value).num : 0)
#define COERCE_INT(m_value)                                                    \
  ((m_value).type == TYPE_NUM ? (m_value).num >> VM_NUM_RATIO_L2 : 0)
#define COERCE_STR(m_value) coerce_str(m_value)
#define COERCE_BOOL(m_value) coerce_bool(m_value)
#define NUM_AS_FLOAT(m_num) ((m_num) / (float)VM_NUM_RATIO)
#define FLOAT_AS_NUM(m_float) (VmNum)((m_float) * VM_NUM_RATIO)
#define NUM_AS_DOUBL(m_num) ((m_num) / (double)VM_NUM_RATIO)
#define DOUBL_AS_NUM(m_float) (VmNum)((m_float) * VM_NUM_RATIO)

size_t mul_by_1_5(size_t value) { return value + (value >> 1); }

VmString make_string_literal(char *value, size_t *read_length) {
  VmString x;
  size_t length = strlen(value) + 1;
  *read_length = length;
  return (VmString){
      .is_literal = true,
      .value = value,
  };
}

void free_string(VmString string) {
  if (!string.is_literal) {
    free(string.value);
  }
}

void set_var(VmState *state, size_t var_ref, VmValue new_value) {
  VmValue old_value = state->vars[var_ref];
  if (old_value.type == TYPE_STRING) {
    free_string(old_value.string);
  }
  state->vars[var_ref] = new_value;
}

void cleanup_val(VmState *state, VmValue value) {
  if (value.type == TYPE_STRING) {
    // Check to make sure this string isn't already stored in a variable.
    size_t occupied_vars = state->occupied_vars;
    for (size_t var_i = 0; var_i < occupied_vars; var_i++) {
      VmValue var_val = state->vars[var_i];
      if (var_val.type == TYPE_STRING &&
          var_val.string.value == value.string.value) {
        return;
      }
    }
    free_string(value.string);
  }
}

#define VM_STRING_MINIMUM_ALLOC 4

VmString string_fmt(char *fmt, ...) {
  size_t allocation_size = VM_STRING_MINIMUM_ALLOC;
  char *str = NULL;
  while (true) {
    str = malloc(sizeof(char) * allocation_size);

    va_list va_args;
    va_start(va_args, fmt);
    size_t written = vsnprintf(str, allocation_size, fmt, va_args);
    va_end(va_args);

    if (written <= allocation_size) {
      return (VmString){
          .is_literal = false,
          .value = str,
      };
    }
    free(str);
    // ~1.5×
    allocation_size += (allocation_size >> 1) + 1;
  }
}

VmString string_cat(const char *a, const char *b) {
  size_t len_a = strlen(a);
  size_t len_b = strlen(b);
  char *str = malloc((len_a + len_b + 1) * sizeof(char));
  memcpy(str, a, len_a);
  memcpy(str + len_a, b, len_b);
  str[len_a + len_b] = '\0';
  return (VmString){
      .is_literal = false,
      .value = str,
  };
}

VmString string_substring(const char *a, size_t start, size_t end) {
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
  return (VmString){
      .is_literal = false,
      .value = str,
  };
}

VmString string_substitute(const char *string, const char *what,
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
  return (VmString){
      .is_literal = false,
      .value = str,
  };
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
  return -1;
}

static const VmString string_true = (VmString){
    .is_literal = true,
    .value = "true",
};
static const VmString string_false = (VmString){
    .is_literal = true,
    .value = "true",
};

static inline __attribute__((__always_inline__)) VmString
coerce_str(VmValue value) {
  if (value.type == TYPE_STRING) {
    return value.string;
  }
  if (value.type == TYPE_BOOL) {
    return value.b ? string_true : string_false;
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
    return strcmp(string_true.value, value.string.value);
  }
  return false;
}

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
    PUSH() = (VmValue){.type = TYPE_NUM, .num = (m_operation) ? 1 : 0};        \
    cleanup_val(state, _a);                                                    \
    cleanup_val(state, _b);                                                    \
  } while (false)

bool vm_step(VmState *state) {
  VmInstruction op = READ_INSTRUCTION();
  switch (op.op) {
  case OP_NOP: {
  } break;
  case OP_NUM: {
    PUSH() = (VmValue){.type = TYPE_NUM, .num = READ_INSTRUCTION().num};
  } break;
  case OP_VAR: {
    PUSH() = (VmValue){.type = TYPE_VAR, .var = READ_INSTRUCTION().var};
  } break;
  case OP_STR: {
    size_t string_length;
    VmString literal = make_string_literal(
        (char *)&state->instructions[state->pc], &string_length);
    // Increment program counter by the length of the string divided by the
    // number of chars per instruction, rounded up.
    state->pc += (string_length + sizeof(size_t) - 1) / sizeof(size_t);
    PUSH() = (VmValue){.type = TYPE_STRING, .string = literal};
  } break;
  case OP_STOR: {
    size_t var_ref = READ_INSTRUCTION().var;
    VmValue a = POP();
    set_var(state, var_ref, a);
    // a doesn't need cleanup because it gets moved to a variable.
  } break;
  case OP_LOAD: {
    size_t var_ref = READ_INSTRUCTION().var;
    PUSH() = state->vars[var_ref];
  } break;
  case JMP: {
    size_t jmp_delta = READ_INSTRUCTION().var;
    state->pc += jmp_delta;
  } break;
  case JMPF: {
    VmValue a = POP();
    if (!COERCE_BOOL(a)) {
      size_t jmp_delta = READ_INSTRUCTION().var;
      state->pc += jmp_delta;
    }
    cleanup_val(state, a);
  } break;
  case JMPT: {
    VmValue a = POP();
    if (COERCE_BOOL(a)) {
      size_t jmp_delta = READ_INSTRUCTION().var;
      state->pc += jmp_delta;
    }
    cleanup_val(state, a);
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
    BINARY_N_OPR(a != b ? 1 : 0);
  } break;
  case OP_EQ: {
    BINARY_N_OPR(a == b ? 1 : 0);
  } break;
  case OP_LT: {
    BINARY_N_OPR(a < b ? 1 : 0);
  } break;
  case OP_LTE: {
    BINARY_N_OPR(a <= b ? 1 : 0);
  } break;
  case OP_GT: {
    BINARY_N_OPR(a > b ? 1 : 0);
  } break;
  case OP_GTE: {
    BINARY_N_OPR(a >= b ? 1 : 0);
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
  case OP_CAT: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmString a = COERCE_STR(_a);
    VmString b = COERCE_STR(_b);
    PUSH() =
        (VmValue){.type = TYPE_STRING, .string = string_cat(a.value, b.value)};
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_SUBSTR: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmValue _c = POP();
    VmString str = COERCE_STR(_a);
    int32_t start = COERCE_INT(_b);
    int32_t end = COERCE_INT(_c);
    PUSH() = (VmValue){
        .type = TYPE_STRING,
        .string = string_substring(str.value, start, end),
    };
    cleanup_val(state, _a);
    cleanup_val(state, _b);
    cleanup_val(state, _c);
  } break;
  case OP_SUBST: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmValue _c = POP();
    VmString str = COERCE_STR(_a);
    VmString what = COERCE_STR(_b);
    VmString with = COERCE_STR(_c);
    PUSH() = (VmValue){
        .type = TYPE_STRING,
        .string = string_substitute(str.value, what.value, with.value),
    };
    cleanup_val(state, _a);
    cleanup_val(state, _b);
    cleanup_val(state, _c);
  } break;
  case OP_FIND: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmString str = COERCE_STR(_a);
    VmString subject = COERCE_STR(_b);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = string_find(str.value, subject.value) << VM_NUM_RATIO_L2,
    };
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_HAS: {
    VmValue _a = POP();
    VmValue _b = POP();
    VmString str = COERCE_STR(_a);
    VmString subject = COERCE_STR(_b);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = string_find(str.value, subject.value) != -1 ? 1 : 0,
    };
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_LEN: {
    VmValue _a = POP();
    VmString str = COERCE_STR(_a);
    PUSH() = (VmValue){
        .type = TYPE_NUM,
        .num = strlen(str.value) << VM_NUM_RATIO_L2,
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
    cleanup_val(state, _a);
    cleanup_val(state, _b);
  } break;
  case OP_PRINT: {
    VmValue _a = POP();
    VmString str = COERCE_STR(_a);
    printf("%s\n", str.value);
    cleanup_val(state, _a);
  } break;
  case OP_EOF: {
    return false;
  } break;
  }
  return true;
}
