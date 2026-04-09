import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Provides a rAF-based tick with delta time in milliseconds.
 * Much more efficient than setInterval for animation.
 */
export function useTick() {
  const elapsed = ref(0)
  let lastTime = 0
  let rafId = 0
  let running = false

  function tick(time: number) {
    if (!running) return
    if (lastTime > 0) {
      const delta = time - lastTime
      elapsed.value += delta
    }
    lastTime = time
    rafId = requestAnimationFrame(tick)
  }

  function start() {
    if (running) return
    running = true
    lastTime = 0
    rafId = requestAnimationFrame(tick)
  }

  function stop() {
    running = false
    cancelAnimationFrame(rafId)
  }

  function reset() {
    elapsed.value = 0
    lastTime = 0
  }

  onMounted(start)
  onUnmounted(stop)

  return { elapsed, start, stop, reset }
}
