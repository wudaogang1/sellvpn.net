import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { plumeTheme } from 'vuepress-theme-plume'

const siteUrl = 'https://sellvpn.net'
const siteName = 'Sell VPN'
const siteDescription =
  'Sell VPN 提供 2026 年机场推荐、VPN 机场测评、科学上网教程、Clash Mi 配置和美区 Apple ID 注册指南。'

const toISOString = (value: unknown): string => {
  if (!value) return ''
  const date = new Date(String(value).replace(/\//g, '-'))
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
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
    ['meta', { name: 'keywords', content: '机场推荐,VPN推荐,科学上网,翻墙机场,Clash教程' }],
  ],
  theme: plumeTheme({
    // logo: '/images/logo.svg',
    home: '/',
    hostname: siteUrl,
    footer: { message: '© Sell VPN 只推荐好用的机场' },

    navbar: [
      { text: '首页', link: '/' },
      { text: '机场推荐', link: '/posts/vpn-airport-ranking-2026/' },
      { text: '优惠码', link: '/posts/airport-coupon-table/' },
      { text: '科学上网教程', link: '/posts/jieshao/' },
      {
        text: '使用教程',
        items: [
          { text: 'Clash Mi 教程', link: '/blog/clashmi/' },
          { text: '美区 Apple ID', link: '/blog/us-apple-id-register/' },
          { text: '如何挑选机场', link: '/article/jeslp91s/' },
        ],
      },
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
      tags: false,
      categories: false,
      archives: false
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
