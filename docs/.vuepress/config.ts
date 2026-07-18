import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { plumeTheme } from 'vuepress-theme-plume'

const siteUrl = 'https://sellvpn.net'
const siteName = 'Sell VPN'
const siteDescription =
  'Sell VPN 整理 2026 最新机场推荐、VPN 推荐、稳定机场排行榜、各大机场优惠码、机场测评、VPN和机场区别、科学上网教程、Clash Mi 与 Shadowrocket 配置指南。'
const defaultKeywords = [
  '2026机场推荐',
  '最新机场推荐',
  '各大机场优惠码',
  '机场优惠码',
  '稳定机场推荐',
  '便宜机场推荐',
  'VPN推荐',
  'VPN机场推荐',
  '机场VPN推荐',
  'VPN和机场区别',
  '翻墙VPN',
  '翻墙机场',
  '科学上网',
  'Clash Mi教程',
  'Shadowrocket教程',
  'Clash Verge教程',
  'ChatGPT节点',
  'ChatGPT机场推荐',
  'YouTube加速',
  '流媒体解锁',
  '流媒体机场推荐',
  '机场测速',
  '机场避坑',
  '机场防跑路',
]

const toISOString = (value: unknown): string => {
  if (!value) return ''
  const date = new Date(String(value).replace(/\//g, '-'))
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split(/[,，、]/)
  return []
}

const cleanKeyword = (value: string): string =>
  value
    .replace(/[✈️👉✅✔]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const getTitleKeywords = (title: unknown): string[] =>
  String(title || '')
    .split(/[：:｜|（）(),，、+]/)
    .map(cleanKeyword)
    .filter((item) => item.length >= 2 && item.length <= 24)

const getCategoryKeywords = (filePathRelative: unknown): string[] => {
  const filePath = String(filePathRelative || '')

  if (filePath.includes('机场测评')) return ['机场测评', '机场怎么样', '机场测速', '机场稳定性', 'VPN机场测评']
  if (filePath.includes('机场推荐')) return ['机场推荐', '机场排行', '机场优惠码', '机场入口', 'VPN推荐']
  if (filePath.includes('科学上网教程')) return ['科学上网教程', '翻墙教程', '代理客户端教程', 'VPN和机场区别']

  return []
}

const getPageKeywords = (page: { frontmatter: Record<string, unknown>; filePathRelative?: string | null; title?: string }): string => {
  const keywords = [
    ...toArray(page.frontmatter.keywords),
    ...toArray(page.frontmatter.tags),
    ...getTitleKeywords(page.frontmatter.title || page.title),
    ...getCategoryKeywords(page.filePathRelative),
    ...defaultKeywords,
  ]

  return [...new Set(keywords.map(cleanKeyword).filter(Boolean))].slice(0, 20).join(',')
}

export default defineUserConfig({
  lang: 'zh-CN',
  title: siteName,
  description: siteDescription,
  head: [
    ['meta', { charset: 'utf-8' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    ['meta', { name: 'author', content: siteName }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
  ],
  theme: plumeTheme({
    // logo: '/images/logo.svg',
    home: '/',
    hostname: siteUrl,
    blogText: '所有文章',
    tagText: '文章标签',
    archiveText: '文章归档',
    footer: { message: '© Sell VPN 只推荐好用的机场' },

    navbar: [
      { text: '首页', link: '/' },
      { text: '2026机场推荐', link: '/posts/vpn-airport-ranking-2026/' },
      { text: '各大机场优惠码', link: '/posts/airport-coupon-table/' },
      {
        text: '专题榜单',
        items: [
          { text: '便宜机场推荐', link: '/posts/cheap-airport-ranking-2026/' },
          { text: 'ChatGPT机场推荐', link: '/posts/chatgpt-airport-ranking-2026/' },
          { text: '流媒体机场推荐', link: '/posts/streaming-airport-ranking-2026/' },
          { text: '机场测速方法', link: '/posts/airport-speed-test-method-2026/' },
          { text: '机场防跑路指南', link: '/posts/airport-risk-checklist-2026/' },
        ],
      },
      { text: '科学上网教程', link: '/posts/jieshao/' },
      {
        text: '使用教程',
        items: [
          { text: 'Clash Mi 教程', link: '/blog/clashmi/' },
          { text: 'Clash Verge 教程', link: '/blog/clash-verge/' },
          { text: 'Shadowrocket 教程', link: '/blog/shadowrocket/' },
          { text: 'VPN和机场区别', link: '/blog/vpn-vs-airport/' },
          { text: '美区 Apple ID', link: '/blog/us-apple-id-register/' },
          { text: '如何挑选机场', link: '/article/jeslp91s/' },
        ],
      },
      { text: '所有文章', link: '/blog/' },
      { text: '联系', link: '/article/w4q5524n/' },
    ],
    profile: {
      name: siteName,
      description: '机场测评、VPN 推荐与科学上网教程',
      // avatar: '/images/logo.svg',
    },
    social: [
      {
        icon: { svg: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M41.4193 7.30899C41.4193 7.30899 45.3046 5.79399 44.9808 9.47328C44.8729 10.9883 43.9016 16.2908 43.1461 22.0262L40.5559 39.0159C40.5559 39.0159 40.3401 41.5048 38.3974 41.9377C36.4547 42.3705 33.5408 40.4227 33.0011 39.9898C32.5694 39.6652 24.9068 34.7955 22.2086 32.4148C21.4531 31.7655 20.5897 30.4669 22.3165 28.9519L33.6487 18.1305C34.9438 16.8319 36.2389 13.8019 30.8426 17.4812L15.7331 27.7616C15.7331 27.7616 14.0063 28.8437 10.7686 27.8698L3.75342 25.7055C3.75342 25.7055 1.16321 24.0823 5.58815 22.459C16.3807 17.3729 29.6555 12.1786 41.4193 7.30899Z"></path> </g></svg>' },
        link: 'https://t.me/sellvpn000'
      },
    ],
    plugins: {
      sitemap: {
        changefreq: 'weekly',
        excludePaths: ['/404.html'],
        modifyTimeGetter: (page) =>
          page.data.git?.updatedTime
            ? new Date(page.data.git.updatedTime).toISOString()
            : toISOString(page.frontmatter.updateTime || page.frontmatter.date || page.frontmatter.createTime),
      },
      seo: {
        canonical: siteUrl,
        author: {
          name: siteName,
          url: `${siteUrl}/article/w4q5524n/`,
        },
        fallBackImage: `${siteUrl}/plume.svg`,
        isArticle: (page) => Boolean(page.filePathRelative && page.path !== '/' && page.path !== '/article/w4q5524n/'),
        customHead: (head, page) => {
          const robots =
            page.path === '/404.html'
              ? 'noindex, nofollow'
              : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

          head.unshift(['meta', { name: 'robots', content: robots }])
          head.unshift(['meta', { name: 'keywords', content: getPageKeywords(page) }])
        },
        jsonLd: (jsonLD, page) => {
          if ('@type' in jsonLD && jsonLD['@type'] === 'Article') {
            const datePublished = toISOString(page.frontmatter.date || page.frontmatter.createTime)
            const dateModified = toISOString(page.frontmatter.updateTime || page.data.git?.updatedTime || page.frontmatter.date || page.frontmatter.createTime)

            return {
              ...jsonLD,
              ...(datePublished ? { datePublished } : {}),
              ...(dateModified ? { dateModified } : {}),
              publisher: {
                '@type': 'Organization',
                name: siteName,
                url: siteUrl,
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${siteUrl}${page.path}`,
              },
            }
          }

          if (page.path === '/') {
            return {
              ...jsonLD,
              publisher: {
                '@type': 'Organization',
                name: siteName,
                url: siteUrl,
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/?s={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }
          }

          return jsonLD
        },
      },
    },
    markdown: {
      collapse: true,
    },
    blog: {
      tags: true,
      tagsTheme: 'brand',
      categories: false,
      archives: true
    },
  }),
  bundler: viteBundler({
    viteOptions: {
      optimizeDeps: {
        exclude: [
          'mark.js/src/vanilla.js',
          '@vueuse/integrations/useFocusTrap',
          '@vueuse/core',
          'bcrypt-ts/browser',
          '@vuepress/helper/client',
          '@iconify/vue',
          '@iconify/vue/offline'
        ]
      }
    }
  }),
})
