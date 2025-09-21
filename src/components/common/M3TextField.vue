<template>
  <div class="m3-text-field" :class="fieldClass">
    <div class="m3-text-field__container">
      <input
        :id="fieldId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="m3-text-field__input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        v-bind="$attrs"
      />
      <label v-if="label" :for="fieldId" class="m3-text-field__label">
        {{ label }}
        <span v-if="required" class="m3-text-field__required">*</span>
      </label>
    </div>
    <div v-if="helperText || error" class="m3-text-field__supporting-text">
      <span v-if="error" class="m3-text-field__error">{{ error }}</span>
      <span v-else-if="helperText" class="m3-text-field__helper">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ' ' // A space is needed for the label to float correctly
  },
  type: {
    type: String,
    default: 'text'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const focused = ref(false)
const fieldId = ref(`m3-text-field-${Math.random().toString(36).substr(2, 9)}`)

const fieldClass = computed(() => {
  return [
    {
      'm3-text-field--focused': focused.value,
      'm3-text-field--disabled': props.disabled,
      'm3-text-field--error': props.error,
      'm3-text-field--filled': props.modelValue != null && props.modelValue.toString().length > 0
    }
  ]
})

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('input', event)
}

const handleFocus = (event) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  focused.value = false
  emit('blur', event)
}
</script>

<style scoped>
.m3-text-field {
  position: relative;
  width: 100%;
}

.m3-text-field__container {
  position: relative;
  border-radius: 20px;
  border: 2px solid var(--border-primary);
  transition: all 0.2s ease;
  background-color: var(--bg-secondary);
}

.m3-text-field__input {
  width: 100%;
  padding: 16px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: var(--text-primary);
  caret-color: var(--accent-primary);
}

.m3-text-field__label {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 16px;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: var(--bg-secondary);
  padding: 0 4px;
}

/* Floating label styles */
.m3-text-field--focused .m3-text-field__label,
.m3-text-field__input:not(:placeholder-shown) + .m3-text-field__label {
  top: 0;
  transform: translateY(-50%) scale(0.8);
  font-size: 12px;
}

/* Hover state */
.m3-text-field:not(.m3-text-field--disabled):hover .m3-text-field__container {
  border-color: var(--accent-secondary);
}

/* Focus state */
.m3-text-field--focused .m3-text-field__container {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(127, 90, 240, 0.2);
}

.m3-text-field--focused .m3-text-field__label {
  color: var(--accent-primary);
  background-color: var(--bg-secondary);
}

/* Error state */
.m3-text-field--error .m3-text-field__container {
  border-color: var(--accent-error);
}

.m3-text-field--error.m3-text-field--focused .m3-text-field__container {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.m3-text-field--error .m3-text-field__label {
  color: var(--accent-error);
}

.m3-text-field--error .m3-text-field__supporting-text {
  color: var(--accent-error);
}

/* Disabled state */
.m3-text-field--disabled .m3-text-field__container {
  background-color: var(--bg-tertiary);
  opacity: 0.6;
}

.m3-text-field--disabled .m3-text-field__input {
  color: var(--text-muted);
}

.m3-text-field--disabled .m3-text-field__label {
  color: var(--text-muted);
}

/* Supporting text */
.m3-text-field__supporting-text {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  padding: 0 16px;
  color: var(--text-secondary);
}
</style>