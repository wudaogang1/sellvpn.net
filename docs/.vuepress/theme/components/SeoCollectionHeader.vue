<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vuepress/client'

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
</script>

<template>
  <header v-if="content" class="seo-collection-header">
    <h1>{{ content.title }}</h1>
    <p>{{ content.description }}</p>
  </header>
</template>

<style scoped>
.seo-collection-header {
  width: 100%;
  max-width: 1104px;
  padding: 0;
  margin: 0 auto 24px;
}

.seo-collection-header h1 {
  margin: 0 0 8px;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  line-height: 1.25;
  color: var(--vp-c-text-1);
}

.seo-collection-header p {
  max-width: 780px;
  margin: 0;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}
</style>
