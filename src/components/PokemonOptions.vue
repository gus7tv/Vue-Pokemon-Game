<template>
  <ul class="options" :class="{ 'is-locked': locked }">
    <li
      v-for="(pokemon, index) in pokemons"
      :key="pokemon.id"
      class="option"
      :class="optionClass(pokemon)"
      :data-types="pokemon.types?.[0]"
      :style="{ animationDelay: `${index * 70}ms` }"
      tabindex="0"
      role="button"
      :aria-label="`Opción ${index + 1}: ${pokemon.name}`"
      @click="select(pokemon)"
      @keydown.enter.prevent="select(pokemon)"
      @keydown.space.prevent="select(pokemon)"
    >
      <span class="option__kbd">{{ index + 1 }}</span>
      <span class="option__name">{{ pokemon.name }}</span>
      <span v-if="showTypes && pokemon.types?.length" class="option__types">
        <span
          v-for="t in pokemon.types"
          :key="t"
          class="type-badge"
          :data-type="t"
        >{{ t }}</span>
      </span>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  pokemons: { type: Array, required: true },
  locked: { type: Boolean, default: false },
  answerId: { type: Number, default: null },
  guessId: { type: Number, default: null },
  showTypes: { type: Boolean, default: true }
})

const emit = defineEmits(['selection'])

const select = (pokemon) => {
  if (props.locked) return
  emit('selection', pokemon.id)
}

const optionClass = (pokemon) => {
  if (!props.locked) return {}
  if (pokemon.id === props.answerId) return { 'is-correct': true }
  if (pokemon.id === props.guessId) return { 'is-wrong': true }
  return { 'is-faded': true }
}
</script>

<style scoped>
.options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.options.is-locked .option { cursor: default; }

.option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
  font-weight: 600;
  font-size: 16px;
  text-transform: capitalize;
  color: var(--text);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
  position: relative;
  overflow: hidden;
  min-width: 0;
  animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.option::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(120deg,
    color-mix(in oklab, var(--holo-1) 45%, transparent),
    color-mix(in oklab, var(--holo-2) 45%, transparent),
    color-mix(in oklab, var(--holo-3) 45%, transparent));
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.option:hover,
.option:focus-visible {
  transform: translateY(-2px);
  background: var(--surface-strong);
  border-color: transparent;
  outline: none;
}
.option:hover::before,
.option:focus-visible::before { opacity: 1; }

.option__kbd {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-dim);
}

.option__name {
  font-size: 16px;
  letter-spacing: 0.02em;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option__types {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-end;
  flex-shrink: 0;
}

.type-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 999px;
  color: white;
  background: #6b7280;
  white-space: nowrap;
}

.type-badge[data-type='fire'] { background: var(--danger); }
.type-badge[data-type='water'] { background: var(--holo-3); }
.type-badge[data-type='grass'] { background: var(--holo-4); color: #1d2129; }
.type-badge[data-type='electric'] { background: var(--holo-5); color: #1d2129; }
.type-badge[data-type='psychic'] { background: var(--holo-1); }
.type-badge[data-type='dragon'] { background: var(--accent); }
.type-badge[data-type='poison'] { background: var(--holo-2); }
.type-badge[data-type='ground'] { background: var(--warning); }
.type-badge[data-type='bug'] { background: var(--success); }
.type-badge[data-type='ice'] { background: #7ec8e8; color: #1d2129; }
.type-badge[data-type='fighting'] { background: #d8602a; }
.type-badge[data-type='flying'] { background: #6ea8e8; }
.type-badge[data-type='rock'] { background: #a08b6a; }
.type-badge[data-type='ghost'] { background: #5b4b9e; }
.type-badge[data-type='dark'] { background: #3d3a4d; }
.type-badge[data-type='steel'] { background: #8a93a8; }
.type-badge[data-type='fairy'] { background: #d98ec0; }
.type-badge[data-type='normal'] { background: #9aa0ad; }

.option.is-correct {
  background: color-mix(in oklab, var(--success) 25%, var(--surface));
  border-color: var(--success);
  box-shadow: 0 0 30px color-mix(in oklab, var(--success) 40%, transparent);
  animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.option.is-wrong {
  background: color-mix(in oklab, var(--danger) 20%, var(--surface));
  border-color: var(--danger);
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.option.is-faded {
  opacity: 0.45;
  filter: saturate(0.7);
}

@media (max-width: 640px) {
  .options { grid-template-columns: 1fr; }
}
</style>
