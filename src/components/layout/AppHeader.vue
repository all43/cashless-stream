<script setup lang="ts">
import { useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import LogoIcon from './LogoIcon.vue'

const route = useRoute()

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/marketplace', label: 'Marketplace' },
]
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b backdrop-blur-md
           dark:border-border dark:bg-surface/80
           border-border-light bg-surface-light/80"
  >
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
      <router-link to="/" class="flex items-center gap-2 font-mono text-sm font-bold tracking-tight
                                  dark:text-text-primary text-slate-800">
        <LogoIcon class="w-6 h-6 rounded-md" />
        <span class="hidden sm:inline">cashless-stream</span>
      </router-link>

      <nav class="flex items-center gap-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="rounded-md px-3 py-1.5 text-sm transition-colors
                 dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-elevated
                 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          :class="{
            'dark:!text-text-primary dark:!bg-surface-elevated !text-slate-900 !bg-slate-100':
              route.path === item.path,
          }"
        >
          {{ item.label }}
        </router-link>

        <div class="ml-2 border-l pl-2 dark:border-border border-border-light">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  </header>
</template>
