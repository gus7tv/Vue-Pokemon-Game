<template>
  <div class="difficulty" :class="{ 'is-expanded': !compact }" role="radiogroup" aria-label="Dificultad">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      role="radio"
      :aria-checked="option.key === current"
      :title="option.description"
      class="difficulty__opt"
      :class="{ 'is-active': option.key === current }"
      @click="$emit('change', option.key)"
    >
      <span class="difficulty__label">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DIFFICULTIES } from '@/helpers/difficulty.js'

defineProps({
  current: { type: String, required: true },
  compact: { type: Boolean, default: true }
})

defineEmits(['change'])

const options = computed(() => Object.values(DIFFICULTIES))
</script>

<style scoped>
.difficulty {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  border-radius: 44px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.difficulty__opt {
  padding: 6px 16px;
  border-radius: 40px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-dim);
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  position: relative;
  overflow: hidden;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.difficulty.is-expanded {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 5px;
  border-radius: 46px;
}

.difficulty.is-expanded .difficulty__opt {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 40px;
  text-align: center;
}

@media (max-width: 540px) {
  .difficulty.is-expanded { grid-template-columns: 1fr; }
}

.difficulty__opt::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg,
    color-mix(in oklab, var(--holo-1) 60%, transparent),
    color-mix(in oklab, var(--holo-2) 60%, transparent) 50%,
    color-mix(in oklab, var(--holo-3) 60%, transparent));
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 0;
}

.difficulty__opt > * {
  position: relative;
  z-index: 1;
}

.difficulty__opt:not(.is-active):hover {
  color: var(--text);
  background: var(--surface-strong);
}

.difficulty__opt.is-active {
  color: #fff;
  background: #1d2129;
  border-color: #1d2129;
  box-shadow: 0 5px 14px rgba(29, 33, 41, 0.3);
}
.difficulty__opt.is-active::before { opacity: 0; }

@media (max-width: 540px) {
  .difficulty__opt { padding: 5px 10px; font-size: 13px; }
}
</style>
