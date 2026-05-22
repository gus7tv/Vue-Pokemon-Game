<template>
  <div class="scoreboard panel">
    <div class="stat stat--score">
      <span class="stat__label">Puntos</span>
      <span class="stat__value holo-text" :class="{ 'is-pulsing': scorePulse }">
        {{ stats.score.toLocaleString() }}
      </span>
      <Transition name="delta">
        <span v-if="lastDelta > 0" :key="deltaKey" class="stat__delta">
          +{{ lastDelta.toLocaleString() }}
        </span>
      </Transition>
    </div>
    <div class="divider" />
    <div class="stat">
      <span class="stat__label">Racha</span>
      <span class="stat__value">
        <span class="streak-flame" v-if="stats.streak >= 3">🔥</span>
        {{ stats.streak }}
      </span>
    </div>
    <div class="divider" />
    <div class="stat">
      <span class="stat__label">Mejor</span>
      <span class="stat__value">{{ stats.bestStreak }}</span>
    </div>
    <div class="divider" />
    <div class="stat">
      <span class="stat__label">Aciertos</span>
      <span class="stat__value">
        {{ stats.correct }}<span class="stat__sub">/{{ stats.played }}</span>
      </span>
    </div>
    <div class="divider" />
    <div class="stat">
      <span class="stat__label">Precisión</span>
      <span class="stat__value">{{ accuracy }}%</span>
    </div>
    <div class="divider" />
    <div class="stat stat--shiny">
      <span class="stat__label">Shinies</span>
      <span class="stat__value">
        <span class="stat__sparkle">✨</span>
        {{ stats.shiniesFound || 0 }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps({
  stats: { type: Object, required: true }
})

const accuracy = computed(() => {
  if (!props.stats.played) return 0
  return Math.round((props.stats.correct / props.stats.played) * 100)
})

const scorePulse = ref(false)
const lastDelta = ref(0)
const deltaKey = ref(0)
let pulseTimer = null
let deltaTimer = null

watch(() => props.stats.score, (newVal, oldVal) => {
  const diff = newVal - oldVal
  if (diff <= 0) return
  lastDelta.value = diff
  deltaKey.value += 1
  scorePulse.value = false
  nextTick(() => {
    scorePulse.value = true
    clearTimeout(pulseTimer)
    pulseTimer = setTimeout(() => { scorePulse.value = false }, 800)
    clearTimeout(deltaTimer)
    deltaTimer = setTimeout(() => { lastDelta.value = 0 }, 1400)
  })
})
</script>

<style scoped>
.scoreboard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 12px 16px;
  flex-wrap: nowrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  flex: 1;
  position: relative;
}

.stat__label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.stat__value {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
}

.stat__value.is-pulsing {
  animation: scorePulse 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scorePulse {
  0% { transform: scale(1); }
  35% { transform: scale(1.55); }
  100% { transform: scale(1); }
}

.stat__delta {
  position: absolute;
  bottom: 100%;
  left: 50%;
  font-size: 15px;
  font-weight: 800;
  color: var(--success);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  text-shadow: 0 0 12px color-mix(in oklab, var(--success) 55%, transparent);
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.delta-enter-active {
  animation: deltaFloat 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.delta-leave-active {
  transition: opacity 0.3s ease;
}
.delta-leave-to { opacity: 0; }

@keyframes deltaFloat {
  0% { opacity: 0; transform: translate(-50%, 8px) scale(0.7); }
  18% { opacity: 1; transform: translate(-50%, -2px) scale(1.1); }
  35% { opacity: 1; transform: translate(-50%, -8px) scale(1); }
  85% { opacity: 1; transform: translate(-50%, -28px) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -36px) scale(0.95); }
}

.stat__sub {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 400;
}

.streak-flame {
  font-size: 19px;
  animation: float 1.5s ease-in-out infinite;
}

.stat--shiny .stat__value {
  background: linear-gradient(110deg, #d97706, #f59e0b, #fbbf24, #f59e0b, #d97706);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: scoreboardShiny 3s linear infinite;
}

@keyframes scoreboardShiny {
  to { background-position: 200% 0; }
}

.stat__sparkle {
  font-size: 15px;
  -webkit-text-fill-color: initial;
}

.divider {
  width: 1px;
  height: 26px;
  background: linear-gradient(180deg, transparent, var(--border-strong), transparent);
  flex-shrink: 0;
}

@media (max-width: 720px) {
  .scoreboard { padding: 12px 14px; }
  .stat__value { font-size: 19px; }
  .divider { display: none; }
}
</style>
