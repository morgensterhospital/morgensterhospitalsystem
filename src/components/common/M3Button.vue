<template>
  <button
    :class="buttonClass"
    :disabled="disabled"
    @click="handleClick"
    v-bind="$attrs"
  >
    <div class="m3-button__overlay"></div>
    <mdi-icon v-if="icon" :path="icon" :size="iconSize" class="m3-button__icon" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import MdiIcon from './MdiIcon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'filled', // filled, tonal, outlined, text
    validator: (value) => ['filled', 'tonal', 'outlined', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: null
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClass = computed(() => {
  return [
    'm3-button',
    `m3-button--${props.variant}`,
    `m3-button--${props.size}`,
    {
      'm3-button--disabled': props.disabled,
      'm3-button--full-width': props.fullWidth,
      'm3-button--icon-only': props.icon && !$slots.default
    }
  ]
})

const iconSize = computed(() => {
  const sizes = {
    small: 18,
    medium: 18,
    large: 24
  }
  return sizes[props.size] || 18
})

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.m3-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  overflow: hidden;
  user-select: none;
}

.m3-button__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: currentColor;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.m3-button:hover .m3-button__overlay {
  opacity: 0.08;
}

.m3-button:focus .m3-button__overlay {
  opacity: 0.12;
}

.m3-button:active .m3-button__overlay {
  opacity: 0.16;
}

/* Sizes */
.m3-button--small {
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
}

.m3-button--medium {
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
}

.m3-button--large {
  height: 48px;
  padding: 0 32px;
  font-size: 15px;
}

/* Variants */
.m3-button--filled {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}
.m3-button--filled:hover {
  box-shadow: 0 4px 12px -2px rgba(127, 90, 240, 0.4);
  transform: translateY(-2px);
}

.m3-button--tonal {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.m3-button--tonal:hover {
  background-color: var(--bg-hover);
}

.m3-button--outlined {
  background-color: transparent;
  color: var(--accent-primary);
  border: 2px solid var(--border-primary);
}
.m3-button--outlined:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-secondary);
}

.m3-button--text {
  background-color: transparent;
  color: var(--accent-primary);
}
.m3-button--text:hover {
  background-color: var(--bg-tertiary);
}

/* Full width */
.m3-button--full-width {
  width: 100%;
}

/* Icon only */
.m3-button--icon-only {
  width: 40px;
  min-width: 40px;
  padding: 0;
  border-radius: 50%;
}

.m3-button--icon-only.m3-button--small {
  width: 32px;
  min-width: 32px;
}

.m3-button--icon-only.m3-button--large {
  width: 48px;
  min-width: 48px;
}

/* Disabled state */
.m3-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}
.m3-button--disabled .m3-button__overlay {
  display: none;
}
</style>