<template>
  <div class="timer" :class="state">
    <svg class="timer__svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="timer__track" cx="50" cy="50" r="44" />
      <circle
        class="timer__bar"
        cx="50"
        cy="50"
        r="44"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <div class="timer__label">
      <span class="timer__seconds">{{ seconds }}</span>
      <span class="timer__unit">seg</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  seconds: { type: Number, required: true },
  progress: { type: Number, required: true }
})

const CIRC = 2 * Math.PI * 44

const dashOffset = computed(() => CIRC * (1 - props.progress))

const state = computed(() => {
  if (props.progress > 0.5) return 'is-safe'
  if (props.progress > 0.2) return 'is-warn'
  return 'is-danger'
})
</script>

<style scoped>
.timer {
  position: relative;
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
}

.timer__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer__track {
  fill: none;
  stroke: var(--border);
  stroke-width: 6;
}

.timer__bar {
  fill: none;
  stroke: var(--success);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 276.46;
  transition: stroke 0.4s ease;
}

.is-safe .timer__bar { stroke: var(--success); }
.is-warn .timer__bar { stroke: var(--warning); }
.is-danger .timer__bar { stroke: var(--danger); }

.timer__label {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.timer__seconds {
  font-size: 29px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.timer__unit {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-top: 2px;
}
</style>
