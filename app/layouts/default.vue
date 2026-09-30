<!-- layouts/default.vue -->

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import Anchor from '~/components/Anchor.vue';

const socials = [
  { label: 'X', icon: 'streamline-logos:x-twitter-logo-solid', to: 'https://x.com/' },
  { label: 'Instagram', icon: 'streamline-logos:instagram-logo-2-solid', to: 'https://instagram.com/' },
  { label: 'GitHub', icon: 'ph:github-logo-bold', to: 'https://github.com/' }
]

const facts = [
  { icon: 'ph:cake-bold', label: '26 year old' },
  { icon: 'ph:book-open-bold', label: 'I really love to read manga' },
  { icon: 'ph:barbell-bold', label: 'I try to workout' },
  { icon: 'ph:sparkle-bold', label: 'I would love to work on new things' }
]

const sections: NavigationMenuItem[] = [
  {
    name: 'About',
    active: true
  },
  {
    name: 'Projects',
  },
  {
    name: 'Experiences'
  },
  {
    name: 'Skills'
  },
  {
    name: 'On my bag'
  }
]
</script>

<template>
  <div class="flex space-x-4 min-h-screen bg-gray-50 dark:bg-gray-950  bg-[repeating-linear-gradient(135deg,transparent_0,transparent_3px,var(--ui-border)_5px,var(--ui-border)_1px)]">
    <USidebar
      :ui="{
        root: 'lg:[--sidebar-width:19rem]',
        container: `
          bg-white dark:bg-black
          border-dashed
        `,
        header: 'px-4 py-3 border-dashed',
        body: 'gap-6 scrollbar-hidden'
      }"
    >
      <template #header>
        <div class="flex w-full items-center justify-between gap-2">
          <span class="flex items-center gap-2 text-sm font-semibold text-highlighted">
            <!-- <UIcon name="ph:hand-fist-bold" class="size-5 text-primary" /> -->
            <UColorModeButton />
            Yeah, it's me
          </span>

          <div class="flex items-center gap-0.5">
            <UButton
              v-for="social in socials"
              :key="social.label"
              :to="social.to"
              :icon="social.icon"
              :aria-label="social.label"
              target="_blank"
              color="neutral"
              variant="ghost"
              size="sm"
              square
            />
          </div>
        </div>
      </template>

      <!-- Identity -->
      <section class="space-y-3">
        <div class="flex items-center gap-3">
          <NuxtImg
            src="/image.png"
            alt="Portrait of Yasser"
            width="80"
            height="80"
            class="size-20 shrink-0 rounded-lg object-cover ring-1 ring-default"
          />
        </div>

        <p class="min-w-0 text-sm font-semibold text-highlighted">
          Yes Sir, I'm Yasser.
        </p>

        <p class="text-sm leading-relaxed text-muted">
          An enthusiastic dev who loves to try stuff and build new things — always curious, always shipping.
        </p>
      </section>

      <USeparator type="dashed" />

      <!-- Some info -->
      <section class="space-y-3">
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <UIcon name="ph:info-bold" class="size-3.5 text-primary" />
          Some info
        </p>

        <ul class="space-y-2.5">
          <li v-for="fact in facts" :key="fact.label" class="flex items-start gap-2.5">
            <UIcon :name="fact.icon" class="mt-0.5 size-4 shrink-0 text-dimmed" />
            <span class="text-sm leading-snug text-toned">{{ fact.label }}</span>
          </li>
        </ul>
      </section>

      <USeparator type="dashed" />

      <!-- Currently active -->
      <section class="space-y-3">
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span class="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          I'm active now
        </p>

        <!-- Github Habit tracker -->
        <div class="rounded-lg border border-dashed border-default px-3 py-4 text-center">
          <UIcon name="ph:github-logo-bold" class="mx-auto size-5 text-dimmed" />
          <p class="mt-1.5 text-xs text-dimmed">
            GitHub activity — coming soon
          </p>
        </div>
      </section>
    </USidebar>

    <UMain class="bg-white dark:bg-black min-w-0 flex-1 border-s border-default border-dashed">
      <slot />
      <Anchor :items="sections"/>
    </UMain>
  </div>
</template>
