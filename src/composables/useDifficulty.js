import { ref, computed, watchEffect } from 'vue'
import { DIFFICULTIES } from '@/helpers/difficulty.js'

const STORAGE_KEY = 'pkmn:difficulty'
const saved = localStorage.getItem(STORAGE_KEY)
const initial = DIFFICULTIES[saved] ? saved : 'normal'

const difficulty = ref(initial)

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, difficulty.value)
})

export function useDifficulty() {
  const config = computed(() => DIFFICULTIES[difficulty.value])

  const setDifficulty = (key) => {
    if (DIFFICULTIES[key]) difficulty.value = key
  }

  return { difficulty, config, setDifficulty }
}
