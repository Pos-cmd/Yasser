<script setup lang="ts">
const { t, locale, locales } = useI18n()

// `SwitchLocalePathLink` est fourni par @nuxtjs/i18n : il resout lui-meme
// l'URL equivalente dans l'autre langue (prefixe de locale remplace) sans
// repasser par la localisation automatique de NuxtLink.
const available = computed(() =>
  locales.value.map(entry => (typeof entry === 'string' ? { code: entry, name: entry } : entry))
)
</script>

<template>
  <div
    role="group"
    :aria-label="t('aria.language')"
    class="flex items-center border border-dashed border-default"
  >
    <SwitchLocalePathLink
      v-for="entry in available"
      :key="entry.code"
      :locale="entry.code"
      :aria-label="entry.name"
      :aria-current="entry.code === locale ? 'true' : undefined"
      class="px-1.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors"
      :class="entry.code === locale
        ? 'bg-elevated font-semibold text-primary'
        : 'text-dimmed hover:text-highlighted'"
    >
      {{ entry.code }}
    </SwitchLocalePathLink>
  </div>
</template>
