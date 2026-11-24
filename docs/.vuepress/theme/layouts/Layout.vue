<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vuepress/client'
import { Layout as PlumeLayout, useData } from 'vuepress-theme-plume/client'
import SeoByline from '../components/SeoByline.vue'
import SeoCollectionHeader from '../components/SeoCollectionHeader.vue'

const route = useRoute()
const { frontmatter, theme } = useData()
const outlineSide = computed(() => {
  const aside = frontmatter.value.aside ?? theme.value.aside
  const outline = frontmatter.value.outline ?? theme.value.outline
  if (outline === false) return
  if (aside === false) return 'mobile'
  return aside === 'left' ? 'left' : 'right'
})

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
  'xx-yun.com',
  'xn--66tw07h.com',
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
    const affiliate = /[?&#](?:aff|affid|affiliate|code|invite|invite_code|ref|referral|r)=/i.test(normalized)
      || affiliateHrefFragments.some(fragment => normalized.includes(fragment))

    relations.add('noopener')
    if (affiliate) {
      relations.add('sponsored')
      relations.add('nofollow')
    } else {
      relations.delete('sponsored')
      relations.delete('nofollow')
    }
    link.rel = [...relations].join(' ')
  }
}

let observer: MutationObserver | undefined

const trackAffiliateClick = (event: MouseEvent) => {
  if (event.button !== (event.type === 'auxclick' ? 1 : 0) || !(event.target instanceof Element)) return
  const link = event.target.closest<HTMLAnchorElement>('a[rel~="sponsored"][href]')
  if (!link || !['https:', 'http:'].includes(link.protocol) || link.origin === location.origin) return

  window.zaraz?.track('affiliate_click', {
    page_path: location.pathname,
    link_domain: link.hostname,
  })
}

const refreshExternalLinks = async () => {
  await nextTick()
  applyExternalLinkPolicy()
}

watch(() => route.fullPath, refreshExternalLinks)

onMounted(() => {
  applyExternalLinkPolicy()
  document.addEventListener('click', trackAffiliateClick, true)
  document.addEventListener('auxclick', trackAffiliateClick, true)
  observer = new MutationObserver(applyExternalLinkPolicy)
  observer.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('click', trackAffiliateClick, true)
  document.removeEventListener('auxclick', trackAffiliateClick, true)
})
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
      >
    </template>
    <template #doc-top>
      <span v-if="outlineSide" :data-sellvpn-outline="outlineSide" hidden />
    </template>
    <template #doc-meta-after>
      <SeoByline />
    </template>
    <template #posts-top>
      <SeoCollectionHeader />
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
