<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vuepress-theme-plume/client'

const { page, frontmatter } = useData()

const showByline = computed(() => Boolean(
  page.value.filePathRelative
  && frontmatter.value.article !== false
  && page.value.path !== '/'
  && page.value.path !== '/article/w4q5524n/',
))
</script>

<template>
  <p v-if="showByline" class="seo-byline" itemprop="author" itemscope itemtype="https://schema.org/Organization">
    <span class="seo-byline-label">作者：</span>
    <a href="/about/" rel="author" itemprop="url">
      <span itemprop="name">Sell VPN</span>
    </a>
    <span aria-hidden="true">·</span>
    <a href="/review-methodology/">测评方法</a>
    <span aria-hidden="true">·</span>
    <a href="/affiliate-disclosure/">联盟披露</a>
  </p>
</template>

<style scoped>
.seo-byline {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.seo-byline-label {
  color: var(--vp-c-text-3);
}

.seo-byline a {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
</style>
