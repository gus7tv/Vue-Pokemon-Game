<template>
  <div class="radar">
    <svg viewBox="0 0 120 120" class="radar__svg" aria-hidden="true">
      <polygon
        v-for="r in 4"
        :key="r"
        class="radar__grid"
        :points="gridPoints(r / 4)"
      />
      <line
        v-for="(label, i) in labels"
        :key="`axis-${i}`"
        class="radar__axis"
        x1="60"
        y1="60"
        :x2="axisPoint(i).x"
        :y2="axisPoint(i).y"
      />
      <polygon class="radar__value" :points="valuePoints" />
      <circle
        v-for="(label, i) in labels"
        :key="`vertex-${i}`"
        class="radar__vertex"
        :cx="valueVertex(i).x"
        :cy="valueVertex(i).y"
        r="2"
      />
    </svg>

    <ul class="radar__legend">
      <li v-for="(label, i) in labels" :key="label">
        <span class="radar__label">{{ label }}</span>
        <span class="radar__num">{{ values[i] }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, required: true }
})

const labels = ['HP', 'ATK', 'DEF', 'S.ATK', 'S.DEF', 'SPE']
const MAX = 200
const CENTER = 60
const RADIUS = 46

const values = computed(() => [
  props.stats.hp,
  props.stats.attack,
  props.stats.defense,
  props.stats.spAttack,
  props.stats.spDefense,
  props.stats.speed
])

const polar = (i, radius) => {
  const angle = (i * 60 - 90) * Math.PI / 180
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius
  }
}

const gridPoints = (factor) => Array.from({ length: 6 }, (_, i) => {
  const p = polar(i, RADIUS * factor)
  return `${p.x},${p.y}`
}).join(' ')

const axisPoint = (i) => polar(i, RADIUS)

const valueVertex = (i) => {
  const v = Math.min(values.value[i], MAX) / MAX
  return polar(i, RADIUS * v)
}

const valuePoints = computed(() =>
  values.value.map((v, i) => {
    const factor = Math.min(v, MAX) / MAX
    const p = polar(i, RADIUS * factor)
    return `${p.x},${p.y}`
  }).join(' ')
)
</script>

<style scoped>
.radar {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
}

.radar__svg {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.radar__grid {
  fill: none;
  stroke: var(--border-strong);
  stroke-width: 0.6;
  opacity: 0.5;
}

.radar__axis {
  stroke: var(--border-strong);
  stroke-width: 0.5;
  opacity: 0.4;
}

.radar__value {
  fill: color-mix(in oklab, var(--holo-2) 55%, transparent);
  stroke: var(--accent);
  stroke-width: 1.4;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 6px color-mix(in oklab, var(--holo-2) 50%, transparent));
}

.radar__vertex {
  fill: var(--accent);
}

.radar__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 14px;
}

.radar__legend li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}

.radar__label {
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-dim);
}

.radar__num {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
</style>
