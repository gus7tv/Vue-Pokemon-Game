import { onMounted, onUnmounted } from 'vue'

export function useKeyboard(handlers) {
  const onKey = (e) => {
    const target = e.target
    if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

    const handler = handlers[e.key] || handlers[e.key.toLowerCase()]
    if (handler) {
      e.preventDefault()
      handler(e)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKey))
  onUnmounted(() => window.removeEventListener('keydown', onKey))
}
