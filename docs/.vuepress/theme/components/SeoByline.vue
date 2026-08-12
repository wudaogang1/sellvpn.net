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

const toDateOnly = (value: unknown): string => {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)

  const match = String(value).trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
  }

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const modifiedDate = computed(() => toDateOnly(
  frontmatter.value.updateTime
  || page.value.git?.updatedTime
  || frontmatter.value.date
  || frontmatter.value.createTime,
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
    <template v-if="modifiedDate">
      <span aria-hidden="true">·</span>
      <span>最近核对：<time :datetime="modifiedDate">{{ modifiedDate }}</time></span>
    </template>
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
