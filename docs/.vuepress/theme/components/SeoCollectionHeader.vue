<script setup lang="ts">
import { computed } from 'vue'
import { RouteLink, useRoute } from 'vuepress/client'

const route = useRoute()

const pages: Record<string, { title: string; description: string }> = {
  '/blog/': {
    title: '所有文章',
    description: '浏览 Sell VPN 的机场推荐、机场测评、优惠信息、科学上网与客户端教程。可继续使用标签、分类和归档缩小范围。',
  },
  '/blog/tags/': {
    title: '按标签浏览文章',
    description: '按机场推荐、VPN、科学上网、客户端、流媒体与 AI 工具等主题查找相关内容。',
  },
  '/blog/categories/': {
    title: '按分类浏览文章',
    description: '从机场推荐、机场测评、科学上网教程和 AI 工具教程四个内容分类进入对应专题。',
  },
  '/blog/archives/': {
    title: '文章更新归档',
    description: '按首次发布日期查看 Sell VPN 的文章记录；具体事实核对时间以文章页显示的“最近核对”为准。',
  },
}

const content = computed(() => pages[route.path])
const sections = [
  { path: '/blog/', label: '全部文章' },
  { path: '/reviews/', label: '机场测评' },
  { path: '/blog/categories/', label: '分类' },
  { path: '/blog/tags/', label: '标签' },
  { path: '/blog/archives/', label: '归档' },
]
</script>

<template>
  <div v-if="content" class="seo-collection-header">
    <header>
      <h1>{{ content.title }}</h1>
      <p>{{ content.description }}</p>
    </header>
    <nav aria-label="文章索引">
      <RouteLink
        v-for="section in sections"
        :key="section.path"
        :to="section.path"
        :aria-current="section.path === route.path ? 'page' : undefined"
      >
        {{ section.label }}
      </RouteLink>
    </nav>
  </div>
</template>

<style scoped>
.seo-collection-header {
  width: 100%;
  max-width: 1104px;
  margin: 0 auto 24px;
}

.seo-collection-header header {
  padding: clamp(24px, 5vw, 52px);
  border: 1px solid var(--sellvpn-c-line);
  border-radius: 18px;
  background: var(--sellvpn-c-soft);
}

.seo-collection-header h1 {
  margin: 0 0 12px;
  font-size: clamp(2rem, 5vw, 3.1rem);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.04em;
  color: var(--sellvpn-c-ink);
}

.seo-collection-header p {
  max-width: 38rem;
  margin: 0;
  line-height: 1.75;
  color: var(--sellvpn-c-muted);
}

.seo-collection-header nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.seo-collection-header nav a {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--sellvpn-c-line);
  border-radius: 8px;
  background: var(--sellvpn-c-panel);
  color: var(--sellvpn-c-muted);
  font-size: 14px;
  font-weight: 650;
}

.seo-collection-header nav a:hover {
  border-color: var(--vp-c-border);
  color: var(--vp-c-brand-1);
}

.seo-collection-header nav a[aria-current="page"] {
  border-color: #174a38;
  background: #174a38;
  color: #fffefa;
}
</style>
