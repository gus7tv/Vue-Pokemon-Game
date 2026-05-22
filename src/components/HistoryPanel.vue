<template>
  <div class="history panel" :class="{ 'is-collapsed': collapsed }">
    <button
      type="button"
      class="history__head"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      <h3 class="history__title">Historial</h3>
      <span class="chip">{{ history.length }} / 10</span>
      <span class="history__chevron">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>

    <div class="history__body">
      <div class="history__bodyInner">
        <ul v-if="history.length" class="history__list">
          <li
            v-for="entry in history"
            :key="entry.ts"
            class="history__item"
            :class="{ 'is-correct': entry.correct, 'is-wrong': !entry.correct, 'is-shiny': entry.isShiny }"
          >
            <span class="history__icon">
              <svg v-if="entry.correct" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="14" r="2.2" />
                <circle cx="8" cy="18" r="2.2" />
                <circle cx="12" cy="14" r="2.2" />
                <circle cx="16" cy="10" r="2.2" />
                <circle cx="20" cy="6" r="2.2" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="2.2" />
                <circle cx="8" cy="8" r="2.2" />
                <circle cx="12" cy="12" r="2.2" />
                <circle cx="16" cy="16" r="2.2" />
                <circle cx="20" cy="20" r="2.2" />
                <circle cx="20" cy="4" r="2.2" />
                <circle cx="16" cy="8" r="2.2" />
                <circle cx="8" cy="16" r="2.2" />
                <circle cx="4" cy="20" r="2.2" />
              </svg>
            </span>
            <span class="history__name">
              {{ entry.pokemon.name }}
              <span v-if="entry.isShiny" class="history__shiny" title="Shiny encontrado">✨</span>
            </span>
            <span class="history__id">#{{ String(entry.pokemon.id).padStart(3, '0') }}</span>
          </li>
        </ul>

        <p v-else class="history__empty">Aún no hay partidas. ¡Empieza a jugar!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  history: { type: Array, required: true }
})

const collapsed = ref(false)
</script>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  flex: 1;
}
.history.is-collapsed {
  flex: 0 0 auto;
  gap: 0;
}

.history__head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: inherit;
}

.history__title {
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-dim);
}

.history__chevron {
  margin-left: auto;
  display: grid;
  place-items: center;
  color: var(--text-dim);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.history.is-collapsed .history__chevron {
  transform: rotate(-90deg);
}

.history__head:hover .history__chevron,
.history__head:hover .history__title {
  color: var(--text);
}

.history__body {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 0;
}
.history.is-collapsed .history__body {
  grid-template-rows: 0fr;
}

.history__bodyInner {
  overflow: hidden;
  min-height: 0;
}

.history__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.history__item {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 40px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  text-transform: capitalize;
  font-size: 14px;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.history__item:hover {
  background: color-mix(in oklab, var(--surface-strong) 90%, var(--accent));
  border-color: color-mix(in oklab, var(--accent) 35%, transparent);
}

.history__icon {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #1d2129;
}
.is-correct .history__icon {
  background: var(--holo-4);
}
.is-wrong .history__icon {
  background: var(--danger);
}

.history__name {
  font-weight: 600;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.history__shiny {
  display: inline-block;
  animation: shinyFloat 2.5s ease-in-out infinite;
}

.is-shiny .history__name {
  background: linear-gradient(110deg, #d97706, #f59e0b, #fbbf24, #f59e0b, #d97706);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shinyShimmer 3s linear infinite;
}

@keyframes shinyShimmer {
  to { background-position: 200% 0; }
}

@keyframes shinyFloat {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-2px) rotate(5deg); }
}

.history__id {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--text-muted);
}

.history__empty {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
