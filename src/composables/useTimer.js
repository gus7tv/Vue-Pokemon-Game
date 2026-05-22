import { ref, computed, onUnmounted } from 'vue'

export function useTimer(durationMs = 10000, onExpire = () => {}) {
  const remaining = ref(durationMs)
  const running = ref(false)
  let rafId = null
  let startedAt = 0
  let baseline = durationMs

  const stop = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    running.value = false
  }

  const tick = () => {
    const elapsed = performance.now() - startedAt
    const next = baseline - elapsed
    if (next <= 0) {
      remaining.value = 0
      stop()
      onExpire()
      return
    }
    remaining.value = next
    rafId = requestAnimationFrame(tick)
  }

  const start = (ms = durationMs) => {
    stop()
    baseline = ms
    remaining.value = ms
    startedAt = performance.now()
    running.value = true
    rafId = requestAnimationFrame(tick)
  }

  const reset = (ms = durationMs) => {
    stop()
    baseline = ms
    remaining.value = ms
  }

  const progress = computed(() => baseline ? remaining.value / baseline : 0)
  const seconds = computed(() => Math.ceil(remaining.value / 1000))

  onUnmounted(stop)

  return { remaining, seconds, progress, running, start, stop, reset }
}
