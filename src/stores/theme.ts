import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref(true)

    function toggle() {
      isDark.value = !isDark.value
    }

    watch(
      isDark,
      (dark) => {
        document.documentElement.classList.toggle('dark', dark)
      },
      { immediate: true },
    )

    return { isDark, toggle }
  },
  {
    persist: true,
  },
)
