<template>
  <header class="app-header">
    <div class="brand">
      <img class="brand__logo" src="/img/logo-poke.png" alt="" aria-hidden="true" />
      <div class="brand__text">
        <h1 class="brand__title holo-text">¿Quién es este pokémon?</h1>
      </div>
    </div>

    <div class="middle">
      <slot name="middle" />
    </div>

    <div class="actions">
      <button
        type="button"
        class="icon-btn"
        :aria-label="muted ? 'Activar sonido' : 'Silenciar'"
        :title="muted ? 'Activar sonido' : 'Silenciar'"
        @click="$emit('toggle-mute')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="!muted" d="M11 5L6 9H2v6h4l5 4V5z" />
          <path v-if="!muted" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path v-if="!muted" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path v-if="muted" d="M11 5L6 9H2v6h4l5 4V5z" />
          <line v-if="muted" x1="23" y1="9" x2="17" y2="15" />
          <line v-if="muted" x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  muted: { type: Boolean, required: true }
})

defineEmits(['toggle-mute'])
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 16px;
}

.middle {
  margin-left: auto;
  display: flex;
}

@media (max-width: 720px) {
  .app-header { flex-wrap: wrap; }
  .middle { margin-left: 0; order: 3; width: 100%; justify-content: center; }
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.brand__logo {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  filter: drop-shadow(0 4px 10px rgba(138, 92, 246, 0.35));
  animation: float 5s ease-in-out infinite;
}

.brand__text { min-width: 0; }

.brand__title {
  font-size: clamp(18px, 2.4vw, 26px);
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand__subtitle {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.icon-btn:hover {
  background: var(--surface-strong);
  transform: translateY(-2px);
  box-shadow: var(--glow-soft);
}
</style>
