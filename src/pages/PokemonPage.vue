<template>
  <main class="page fade-in">
    <AppHeader
      v-if="gameStarted"
      :muted="muted"
      @toggle-mute="toggleMute"
    >
      <template #middle>
        <DifficultyPicker :current="difficulty" @change="changeDifficulty" />
      </template>
    </AppHeader>

    <section v-if="gameStarted" class="page__controls">
      <Scoreboard :stats="stats" />
    </section>

    <section v-if="!gameStarted" class="welcome">
      <div class="welcome__panel">
        <div class="welcome__brand">
          <img class="welcome__logo" src="/img/logo-poke.png" alt="" aria-hidden="true" />
          <h2 class="welcome__title holo-text">¿Quién es este pokémon?</h2>
        </div>
        <p class="welcome__sub">
          Mira la silueta y elige el nombre correcto antes de que se acabe el tiempo.
        </p>

        <div class="welcome__field">
          <span class="welcome__label">Dificultad</span>
          <DifficultyPicker
            :current="difficulty"
            :compact="false"
            @change="changeDifficulty"
          />
        </div>

        <div class="welcome__field">
          <span class="welcome__label">Sonido</span>
          <div class="sound-toggle" role="radiogroup" aria-label="Sonido">
            <button
              type="button"
              role="radio"
              :aria-checked="!muted"
              class="sound-toggle__opt"
              :class="{ 'is-active': !muted }"
              @click="muted && toggleMute()"
            >
              🔊 Activado
            </button>
            <button
              type="button"
              role="radio"
              :aria-checked="muted"
              class="sound-toggle__opt"
              :class="{ 'is-active': muted }"
              @click="!muted && toggleMute()"
            >
              🔇 Silenciado
            </button>
          </div>
        </div>

        <div v-if="stats.played > 0" class="welcome__stats">
          <div class="welcome__stat">
            <span class="welcome__stat-label">Mejor racha</span>
            <span class="welcome__stat-value">{{ stats.bestStreak }}</span>
          </div>
          <div class="welcome__stat">
            <span class="welcome__stat-label">Puntos totales</span>
            <span class="welcome__stat-value">{{ stats.score.toLocaleString() }}</span>
          </div>
          <div class="welcome__stat">
            <span class="welcome__stat-label">Shinies</span>
            <span class="welcome__stat-value">✨ {{ stats.shiniesFound || 0 }}</span>
          </div>
        </div>

        <ActionButton class="welcome__cta" @click="startGame">
          Comenzar partida
        </ActionButton>
      </div>
    </section>

    <section v-else class="page__stage">
      <aside
        class="page__side page__side--game"
        :class="{ 'is-centered': !showAnswer }"
      >
        <div v-if="!showAnswer" class="game__head">
          <div v-if="config.durationMs" class="game__timer">
            <Timer :seconds="seconds" :progress="progress" />
          </div>
          <h3 class="game__title">Selecciona una opción</h3>
        </div>
        <div
          v-else
          class="game__head game__head--result"
          :class="lastWasCorrect ? 'is-correct' : 'is-wrong'"
        >
          <span class="game__head-icon" aria-hidden="true">
            <svg v-if="lastWasCorrect" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="4" cy="14" r="1.9" />
              <circle cx="8" cy="18" r="1.9" />
              <circle cx="12" cy="14" r="1.9" />
              <circle cx="16" cy="10" r="1.9" />
              <circle cx="20" cy="6" r="1.9" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="4" cy="4" r="1.9" />
              <circle cx="8" cy="8" r="1.9" />
              <circle cx="12" cy="12" r="1.9" />
              <circle cx="16" cy="16" r="1.9" />
              <circle cx="20" cy="20" r="1.9" />
              <circle cx="20" cy="4" r="1.9" />
              <circle cx="16" cy="8" r="1.9" />
              <circle cx="8" cy="16" r="1.9" />
              <circle cx="4" cy="20" r="1.9" />
            </svg>
          </span>
          <p class="verdict__summary">
            <span class="result__msg">
              <span v-if="lastWasCorrect">¡Correcto!</span>
              <span v-else-if="timedOut">¡Tiempo!</span>
              <span v-else>¡Casi!</span>
            </span>
            <span v-if="lastWasCorrect" class="result__points">+{{ lastPoints }} pts</span>
          </p>
        </div>

        <PokemonOptions
          :pokemons="pokemonArr"
          :locked="showAnswer"
          :answer-id="pokemon?.id ?? null"
          :guess-id="lastGuessId"
          :show-types="difficulty !== 'hard' || showAnswer"
          @selection="checkAnswer"
        />

        <Transition name="swap" mode="out-in">
          <div
            v-if="showAnswer"
            key="result"
            class="result"
            :class="lastWasCorrect ? 'is-correct' : 'is-wrong'"
          >
            <div v-if="pokemon?.genera || pokemon?.flavorText" class="result__lore">
              <p v-if="pokemon?.genera" class="result__genera">Pokémon {{ pokemon.genera }}</p>
              <p v-if="pokemon?.flavorText" class="result__flavor">"{{ pokemon.flavorText }}"</p>
            </div>

            <StatsRadar v-if="pokemon?.stats" :stats="pokemon.stats" />
          </div>

          <button
            v-else
            key="hints"
            type="button"
            class="hint-btn"
            :class="{ 'has-hints': revealedHints.length }"
            :disabled="!remainingHints.length"
            @click="requestHint"
          >
            <span class="hint-btn__main">
              <span class="hint-btn__kbd">💡</span>
              <span class="hint-btn__text">
                {{ remainingHints.length ? `Pista (-${Math.round(HINT_COST * 100)}%)` : 'Sin más pistas' }}
              </span>
            </span>
            <span v-if="revealedHints.length" class="hint-btn__hints">
              <span
                v-for="h in revealedHints"
                :key="h.key"
                class="chip chip--hint"
              >
                {{ h.label }}: <strong>{{ h.value }}</strong>
              </span>
            </span>
          </button>
        </Transition>
      </aside>

      <div class="page__center">
        <HologramCard
          :src="pokemon?.sprite"
          :alt="pokemon ? pokemon.name : 'pokémon'"
          :revealed="showAnswer"
          :interactive="showAnswer"
          :holo-style="holoStyle"
          :is-shiny="!!pokemon?.isShiny"
        />

        <Transition name="swap">
          <div
            v-if="showAnswer"
            class="verdict"
            :class="lastWasCorrect ? 'is-correct' : 'is-wrong'"
          >
            <p v-if="pokemon" class="result__name holo-text">{{ pokemon.name }}</p>
            <ActionButton @click="newGame">Siguiente</ActionButton>
          </div>
        </Transition>
      </div>

      <aside class="page__side page__side--history">
        <HistoryPanel :history="stats.history" />
      </aside>
    </section>

    <Transition name="result">
      <div v-if="showConfetti" class="confetti" aria-hidden="true">
        <span v-for="n in 24" :key="n" :style="confettiStyle(n)" />
      </div>
    </Transition>
  </main>

  <div v-if="!gameStarted" class="welcome-bg" aria-hidden="true" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import HologramCard from '@/components/HologramCard.vue'
import PokemonOptions from '@/components/PokemonOptions.vue'
import Scoreboard from '@/components/Scoreboard.vue'
import Timer from '@/components/Timer.vue'
import DifficultyPicker from '@/components/DifficultyPicker.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import StatsRadar from '@/components/StatsRadar.vue'
import ActionButton from '@/components/ActionButton.vue'

import { getPokemonOptions } from '@/helpers/getPokemonOptions.js'
import { calcPoints } from '@/helpers/difficulty.js'
import { getHoloStyle } from '@/helpers/holoStyle.js'
import { useSound } from '@/composables/useSound.js'
import { useStats } from '@/composables/useStats.js'
import { useTimer } from '@/composables/useTimer.js'
import { useDifficulty } from '@/composables/useDifficulty.js'
import { useKeyboard } from '@/composables/useKeyboard.js'

const { muted, toggleMute, click, correct, wrong, tick, timeout, playCry } = useSound()
const { stats, register } = useStats()
const { difficulty, config, setDifficulty } = useDifficulty()

const pokemonArr = ref([])
const pokemon = ref(null)
const showAnswer = ref(false)
const lastGuessId = ref(null)
const lastWasCorrect = ref(false)
const lastPoints = ref(0)
const timedOut = ref(false)
const loading = ref(false)
const showConfetti = ref(false)
const gameStarted = ref(false)

const startGame = () => {
  click()
  gameStarted.value = true
  mixPokemonArray()
}

const holoStyle = computed(() => getHoloStyle(pokemon.value))

const onTimeout = () => {
  if (showAnswer.value) return
  timedOut.value = true
  reveal({ correctGuess: false, points: 0 })
  timeout()
}

const { seconds, progress, start: startTimer, stop: stopTimer } = useTimer(config.value.durationMs, onTimeout)

let lastTickSecond = 0
watch(seconds, (s) => {
  if (showAnswer.value) return
  if (s <= 3 && s !== lastTickSecond && s > 0) {
    lastTickSecond = s
    tick()
  }
})

const SHINY_CHANCE = 1 / 30
const HINT_COST = 0.25

const hintsUsed = ref(0)
const revealedHints = ref([])

const availableHints = computed(() => {
  if (!pokemon.value) return []
  const list = []
  if (pokemon.value.genera) list.push({ key: 'genera', label: 'Categoría', value: pokemon.value.genera })
  if (pokemon.value.color) list.push({ key: 'color', label: 'Color', value: translateColor(pokemon.value.color) })
  if (pokemon.value.habitat) list.push({ key: 'habitat', label: 'Hábitat', value: translateHabitat(pokemon.value.habitat) })
  return list
})

const remainingHints = computed(() => availableHints.value.filter(
  (h) => !revealedHints.value.find((r) => r.key === h.key)
))

const requestHint = () => {
  if (showAnswer.value || !remainingHints.value.length) return
  click()
  revealedHints.value.push(remainingHints.value[0])
  hintsUsed.value += 1
}

const translateColor = (c) => ({
  black: 'negro', blue: 'azul', brown: 'marrón', gray: 'gris', green: 'verde',
  pink: 'rosa', purple: 'morado', red: 'rojo', white: 'blanco', yellow: 'amarillo'
}[c] || c)

const translateHabitat = (h) => ({
  cave: 'cuevas', forest: 'bosques', grassland: 'praderas', mountain: 'montañas',
  rare: 'lugares raros', 'rough-terrain': 'terreno escarpado', sea: 'el mar',
  urban: 'zonas urbanas', 'waters-edge': 'orillas del agua'
}[h] || h)

const mixPokemonArray = async () => {
  loading.value = true
  showAnswer.value = false
  timedOut.value = false
  lastGuessId.value = null
  pokemonArr.value = []
  pokemon.value = null
  hintsUsed.value = 0
  revealedHints.value = []

  try {
    pokemonArr.value = await getPokemonOptions({
      count: config.value.options,
      maxId: config.value.maxPokemonId,
      exclude: stats.solvedIds
    })
    const rndInt = Math.floor(Math.random() * pokemonArr.value.length)
    const chosen = pokemonArr.value[rndInt]
    const isShiny = Math.random() < SHINY_CHANCE && !!chosen.spriteShiny
    pokemon.value = {
      ...chosen,
      isShiny,
      sprite: isShiny ? chosen.spriteShiny : chosen.sprite
    }
    lastTickSecond = 0
    startTimer(config.value.durationMs)
  } finally {
    loading.value = false
  }
}

const reveal = ({ correctGuess, points }) => {
  stopTimer()
  showAnswer.value = true
  lastWasCorrect.value = correctGuess
  lastPoints.value = points

  if (pokemon.value?.cry) playCry(pokemon.value.cry)

  if (correctGuess) {
    register({
      pokemon: pokemon.value,
      guessId: lastGuessId.value,
      correct: true,
      points,
      isShiny: !!pokemon.value?.isShiny
    })
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 1400)
  } else {
    register({
      pokemon: pokemon.value,
      guessId: lastGuessId.value,
      correct: false,
      points: 0,
      isShiny: !!pokemon.value?.isShiny
    })
  }
}

const checkAnswer = (selectedId) => {
  if (showAnswer.value) return
  click()
  lastGuessId.value = selectedId
  const isCorrect = selectedId === pokemon.value?.id
  const remaining = seconds.value * 1000
  const basePoints = isCorrect ? calcPoints(config.value, remaining, stats.streak) : 0
  const hintMultiplier = Math.max(0.25, 1 - HINT_COST * hintsUsed.value)
  const shinyMultiplier = pokemon.value?.isShiny ? 3 : 1
  const points = Math.round(basePoints * hintMultiplier * shinyMultiplier)
  reveal({ correctGuess: isCorrect, points })
  isCorrect ? correct() : wrong()
}

const newGame = () => {
  click()
  mixPokemonArray()
}

const changeDifficulty = (key) => {
  if (key === difficulty.value) return
  click()
  setDifficulty(key)
  if (gameStarted.value) mixPokemonArray()
}

const selectByIndex = (idx) => {
  if (showAnswer.value) return
  const target = pokemonArr.value[idx]
  if (target) checkAnswer(target.id)
}

useKeyboard({
  '1': () => selectByIndex(0),
  '2': () => selectByIndex(1),
  '3': () => selectByIndex(2),
  '4': () => selectByIndex(3),
  '5': () => selectByIndex(4),
  '6': () => selectByIndex(5),
  ' ': () => {
    if (!gameStarted.value) startGame()
    else if (showAnswer.value) newGame()
  },
  'Enter': () => {
    if (!gameStarted.value) startGame()
    else if (showAnswer.value) newGame()
  },
  'm': () => toggleMute()
})

const confettiStyle = (n) => {
  const colors = ['var(--holo-1)', 'var(--holo-2)', 'var(--holo-3)', 'var(--holo-4)', 'var(--holo-5)']
  return {
    left: `${(n * 4.16) % 100}%`,
    background: colors[n % colors.length],
    animationDelay: `${(n % 6) * 60}ms`,
    animationDuration: `${1.1 + (n % 5) * 0.15}s`
  }
}

</script>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 0 clamp(20px, 4vw, 48px) 48px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.welcome-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: url('/img/pokepattern.jpg');
  background-repeat: repeat;
  background-size: 320px;
  opacity: 0.06;
  mix-blend-mode: multiply;
  pointer-events: none;
  animation: drift 70s linear infinite;
}

.page__controls {
  display: block;
}

.page__stage {
  display: grid;
  grid-template-columns: minmax(420px, 480px) 1fr minmax(240px, 280px);
  gap: 28px;
  align-items: stretch;
}

.welcome {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: clamp(20px, 4vw, 56px) 0;
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.welcome__panel {
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: clamp(24px, 4vw, 36px);
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.welcome__panel::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(120deg,
    color-mix(in oklab, var(--holo-1) 55%, transparent),
    color-mix(in oklab, var(--holo-2) 55%, transparent),
    color-mix(in oklab, var(--holo-3) 55%, transparent));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  opacity: 0.65;
}

.welcome__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.welcome__logo {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  filter: drop-shadow(0 4px 10px rgba(138, 92, 246, 0.35));
  animation: float 5s ease-in-out infinite;
}

.welcome__title {
  margin: 0;
  font-size: clamp(23px, 3.2vw, 32px);
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
}

.welcome__sub {
  margin: 0;
  font-size: 16px;
  color: var(--text-dim);
  line-height: 1.5;
  text-align: center;
}

.welcome__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.welcome__label {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  text-align: center;
}

.sound-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 5px;
  border-radius: 46px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.sound-toggle__opt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 40px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-dim);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.02em;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  position: relative;
  overflow: hidden;
}

.sound-toggle__opt::before {
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
  z-index: -1;
}

.sound-toggle__opt:not(.is-active):hover {
  color: var(--text);
  background: var(--surface-strong);
}

.sound-toggle__opt.is-active {
  color: #fff;
  background: #1d2129;
  border-color: #1d2129;
  box-shadow: 0 5px 14px rgba(29, 33, 41, 0.3);
}
.sound-toggle__opt.is-active::before { opacity: 0; }

.welcome__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: color-mix(in oklab, var(--surface-strong) 80%, transparent);
  border: 1px solid var(--border);
}

.welcome__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.welcome__stat-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.welcome__stat-value {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.welcome__cta {
  margin-top: 6px;
  align-self: center;
}


.page__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-top: 8px;
}

.page__side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page__side--game.is-centered {
  justify-content: flex-start;
}

.page__hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.verdict {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(340px, 100%);
  padding: 14px 18px;
  border-radius: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(12px);
}

.verdict .result__name {
  text-align: center;
}

.verdict__summary {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(12px);
}

.result__lore {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result__genera {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
  font-weight: 700;
}

.result__flavor {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: color-mix(in oklab, var(--surface-strong) 60%, transparent);
  border: 1px solid var(--border);
  font-style: italic;
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--text-dim);
}

.game__head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.game__head--result {
  min-height: 76px;
}

.game__head-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  color: #1d2129;
}
.game__head--result.is-correct .game__head-icon {
  background: var(--holo-4);
}
.game__head--result.is-wrong .game__head-icon {
  background: var(--danger);
}

.game__head--result .verdict__summary {
  align-items: baseline;
}

.game__head--result .result__msg {
  font-size: 20px;
}

.game__head--result .result__points {
  font-size: 22px;
}

.game__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--text-dim);
}

.game__timer {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.game__timer :deep(.timer) {
  transform: scale(0.84);
}

.hint-btn {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
  color: var(--text);
  font-weight: 600;
  font-size: 16px;
  text-align: left;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  transition: transform 0.2s ease, box-shadow 0.25s ease, background 0.2s ease, border-color 0.25s ease;
  position: relative;
  overflow: hidden;
}

.hint-btn__main {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
}

.hint-btn__hints {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.hint-btn::before {
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
.hint-btn:hover:not(:disabled),
.hint-btn:focus-visible:not(:disabled) {
  transform: translateY(-2px);
  background: var(--surface-strong);
  border-color: transparent;
  outline: none;
}
.hint-btn:hover:not(:disabled)::before,
.hint-btn:focus-visible:not(:disabled)::before { opacity: 1; }

.hint-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hint-btn__kbd {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  font-size: 15px;
  line-height: 1;
}

.hint-btn__text {
  font-size: 16px;
  letter-spacing: 0.02em;
}

.chip--hint {
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 12px;
  background: color-mix(in oklab, var(--holo-2) 18%, var(--surface-strong));
  border-color: color-mix(in oklab, var(--accent) 30%, transparent);
  color: var(--text);
  animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.chip--hint strong { color: var(--accent); font-weight: 700; }


.result__msg {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.result__name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  text-transform: capitalize;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result__points {
  margin: 0 0 1px;
  font-size: 19px;
  font-weight: 800;
  color: var(--success);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}


.result-enter-active,
.result-leave-active,
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.result-enter-from,
.result-leave-to,
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
}

.confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}
.confetti span {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: confettiFall linear forwards;
  transform-origin: center;
}

@keyframes confettiFall {
  to {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
}

@media (max-width: 1080px) {
  .page__stage {
    grid-template-columns: 1fr;
  }
  .page__side--history {
    order: 3;
  }
  .page__side--game {
    order: 2;
  }
  .page__center {
    order: 1;
  }
}

@media (max-width: 720px) {
  .page__controls {
    grid-template-columns: 1fr;
  }
}
</style>
