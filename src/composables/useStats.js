import { reactive, watch } from 'vue'

const STORAGE_KEY = 'pkmn:stats'

const defaults = () => ({
  score: 0,
  streak: 0,
  bestStreak: 0,
  played: 0,
  correct: 0,
  shiniesFound: 0,
  solvedIds: [],
  history: []
})

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults()
    return { ...defaults(), ...JSON.parse(raw) }
  } catch {
    return defaults()
  }
}

const stats = reactive(load())

watch(stats, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useStats() {
  const register = ({ pokemon, guessId, correct, points = 0, isShiny = false }) => {
    stats.played += 1
    if (correct) {
      stats.correct += 1
      stats.streak += 1
      stats.score += points
      if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak
      if (isShiny) stats.shiniesFound += 1
      if (pokemon?.id != null && !stats.solvedIds.includes(pokemon.id)) {
        stats.solvedIds.push(pokemon.id)
      }
    } else {
      stats.streak = 0
    }
    stats.history.unshift({
      ts: Date.now(),
      pokemon: { id: pokemon.id, name: pokemon.name },
      guessId,
      correct,
      isShiny
    })
    if (stats.history.length > 10) stats.history.length = 10
  }

  const reset = () => {
    Object.assign(stats, defaults())
  }

  return { stats, register, reset }
}
