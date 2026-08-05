<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vuepress/client'
import { Layout as PlumeLayout } from 'vuepress-theme-plume/client'
import SeoByline from '../components/SeoByline.vue'

const route = useRoute()
const affiliateHrefFragments = [
  '99ba.net',
  'bianyuanjiediantttt.xyz',
  'cocoduck.live',
  'cpdd.one',
  'edgenovaaff.com',
  'fireflyaff.com',
  'gcvipaff.cc',
  'gntvipaff.cc',
  'goflybit.com',
  'gsyaff.com',
  'hello-ssone.com',
  'jichang.best',
  'kuailiaff.com',
  'sogoaff.com',
  'speedworldaff.com',
  'v2cvipaff.cc',
  'vipaff.cc',
  'worryfreeaff.com',
  'xxyun.at',
  'xn--66tw07h.com',
  '1flyunaff.cc',
  'fb7777.shop',
  '快车.com',
]

const applyExternalLinkPolicy = () => {
  if (typeof document === 'undefined') return

  for (const link of document.querySelectorAll<HTMLAnchorElement>('.vp-layout a[href]')) {
    const href = link.getAttribute('href') || ''
    if (!/^https?:\/\//i.test(href)) continue

    let url: URL
    try {
      url = new URL(href)
    } catch {
      continue
    }
    if (/(?:^|\.)sellvpn\.net$/i.test(url.hostname)) continue

    const relations = new Set(link.rel.toLowerCase().split(/\s+/).filter(Boolean))
    const normalized = href.toLowerCase()
    const affiliate = /[?&#](?:aff|affid|affiliate|code|invite|ref|referral|r)=/i.test(normalized)
      || affiliateHrefFragments.some(fragment => normalized.includes(fragment))

    relations.add('nofollow')
    relations.add('noopener')
    if (affiliate) relations.add('sponsored')
    else relations.delete('sponsored')
    link.rel = [...relations].join(' ')
  }
}

let observer: MutationObserver | undefined

const refreshExternalLinks = async () => {
  await nextTick()
  applyExternalLinkPolicy()
}

watch(() => route.fullPath, refreshExternalLinks)

onMounted(() => {
  applyExternalLinkPolicy()
  observer = new MutationObserver(applyExternalLinkPolicy)
  observer.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <PlumeLayout>
    <template #nav-bar-title-before>
      <img
        class="sellvpn-nav-logo"
        src="/sellvpn-logo.svg"
        alt="Sell VPN"
        width="512"
        height="512"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      >
    </template>
    <template #doc-meta-after>
      <SeoByline />
    </template>
  </PlumeLayout>
</template>

<style scoped>
.sellvpn-nav-logo {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}
</style>
