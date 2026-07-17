#ifndef __SRC_C_VM_MINIMAL_H
#define __SRC_C_VM_MINIMAL_H

#include <stdint.h>

typedef enum {
  STEP_RESULT_CONTINUE,
  STEP_RESULT_SUSPEND,
  STEP_RESULT_PAUSE,
  STEP_RESULT_DONE,
} VmStepResult;

#endif
