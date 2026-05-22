import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'pkmn:muted'
const muted = ref(localStorage.getItem(STORAGE_KEY) === '1')

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, muted.value ? '1' : '0')
})

let ctx = null
const ensureCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const tone = ({ freq = 440, duration = 0.15, type = 'sine', gain = 0.12, sweep = 0 }) => {
  if (muted.value) return
  const c = ensureCtx()
  const now = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (sweep) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), now + duration)

  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(gain, now + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(g).connect(c.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

const arpeggio = (notes, step = 0.08, opts = {}) => {
  notes.forEach((freq, i) => {
    setTimeout(() => tone({ freq, ...opts }), i * step * 1000)
  })
}

let activeCry = null
const playCry = (url) => {
  if (muted.value || !url) return
  try {
    if (activeCry) { activeCry.pause(); activeCry.src = '' }
    activeCry = new Audio(url)
    activeCry.volume = 0.35
    activeCry.play().catch(() => {})
  } catch {
    /* ignore audio failures */
  }
}

export function useSound() {
  const click = () => tone({ freq: 520, duration: 0.06, type: 'triangle', gain: 0.06 })
  const hover = () => tone({ freq: 880, duration: 0.04, type: 'sine', gain: 0.03 })
  const correct = () => arpeggio([523.25, 659.25, 783.99, 1046.5], 0.07, { duration: 0.18, type: 'triangle', gain: 0.1 })
  const wrong = () => {
    tone({ freq: 220, duration: 0.25, type: 'sawtooth', gain: 0.12, sweep: -120 })
    setTimeout(() => tone({ freq: 130, duration: 0.3, type: 'square', gain: 0.08, sweep: -40 }), 80)
  }
  const tick = () => tone({ freq: 1200, duration: 0.03, type: 'square', gain: 0.04 })
  const timeout = () => tone({ freq: 180, duration: 0.5, type: 'sawtooth', gain: 0.14, sweep: -100 })

  const toggleMute = () => { muted.value = !muted.value }

  return { muted, toggleMute, click, hover, correct, wrong, tick, timeout, playCry }
}
