import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { plumeTheme } from 'vuepress-theme-plume'

const siteUrl = 'https://sellvpn.net'
const siteHostPattern = /^https?:\/\/(?:www\.)?sellvpn\.net(?=[:/]|$)/i
const siteName = 'Sell VPN'
const siteDescription =
  'Sell VPN 整理 2026 最新机场推荐、VPN 推荐、稳定机场排行榜、各大机场优惠码、机场测评、VPN和机场区别、科学上网教程、Clash Mi 与 Shadowrocket 配置指南。'
const organizationId = `${siteUrl}/#organization`
const websiteId = `${siteUrl}/#website`
const authorUrl = `${siteUrl}/about/`
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
  '1flyunaff.cc',
  'fb7777.shop',
  'xn--66tw07h.com',
  '快车.com',
]
const knownRemoteImageDimensions = new Map([
  ['https://image.ermao.net/images/blog/clashmi/20260305_103545-57abfa.png', { width: 256, height: 256 }],
  ['https://image.ermao.net/images/blog/clashmi/20260305_103743-3935fc.png', { width: 480, height: 651 }],
  ['https://image.ermao.net/images/blog/clashmi/20260305_103809-b1ab1b.png', { width: 706, height: 480 }],
  ['https://image.ermao.net/images/blog/clashmi/20260305_103816-7c1edf.png', { width: 854, height: 422 }],
  ['https://image.ermao.net/images/blog/clashmi/20260305_103836-d45527.png', { width: 480, height: 543 }],
])

const toISOString = (value: unknown): string => {
  if (!value) return ''
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString()

  const normalized = String(value).trim().replace(/\//g, '-')
  const withTimezone = /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? `${normalized}T00:00:00.000Z`
    : /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(normalized)
      ? `${normalized.replace(' ', 'T')}Z`
      : normalized
  const date = new Date(withTimezone)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

const latestISOString = (...values: unknown[]): string => {
  const timestamps = values
    .map(toISOString)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())

  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : ''
}

const organization = {
  '@type': 'Organization',
  '@id': organizationId,
  name: siteName,
  url: siteUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${siteUrl}/sellvpn-logo.svg`,
    width: 512,
    height: 512,
  },
}

const editorialAuthor = {
  '@type': 'Organization',
  '@id': `${authorUrl}#organization`,
  name: siteName,
  url: authorUrl,
}

const breadcrumbJsonLd = (page: { path: string; title?: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '首页',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: page.title || siteName,
      item: `${siteUrl}${page.path}`,
    },
  ],
})

const seoMarkdownPlugin = () => ({
  name: 'sellvpn-seo-markdown',
  extendsMarkdown: (md: any) => {
    const defaultLinkOpen = md.renderer.rules.link_open
      || ((tokens: any[], index: number, options: unknown, _env: unknown, self: any) => self.renderToken(tokens, index, options))
    const defaultImage = md.renderer.rules.image
      || ((tokens: any[], index: number, options: unknown, _env: unknown, self: any) => self.renderToken(tokens, index, options))

    md.renderer.rules.link_open = (tokens: any[], index: number, options: unknown, env: unknown, self: any) => {
      const token = tokens[index]
      const href = String(token.attrGet('href') || '')

      if (/^https?:\/\//i.test(href) && !siteHostPattern.test(href)) {
        const relations = new Set(String(token.attrGet('rel') || '').split(/\s+/).filter(Boolean))
        relations.add('nofollow')
        relations.add('noopener')
        const normalized = href.toLowerCase()
        const affiliate = /[?&#](?:aff|affid|affiliate|code|invite|ref|referral|r)=/i.test(normalized)
          || affiliateHrefFragments.some((fragment) => normalized.includes(fragment))
        if (affiliate) relations.add('sponsored')
        token.attrSet('rel', [...relations].join(' '))
      }

      return defaultLinkOpen(tokens, index, options, env, self)
    }

    md.renderer.rules.image = (tokens: any[], index: number, options: unknown, env: unknown, self: any) => {
      const token = tokens[index]
      const src = String(token.attrGet('src') || '')
      const remoteDimensions = knownRemoteImageDimensions.get(src)
      const frontmatterCover = String((env as { frontmatter?: { cover?: unknown } })?.frontmatter?.cover || '')
      const cover = /(?:^|\/)cover-[^/?#]+/i.test(src) || src === frontmatterCover
      token.attrSet('decoding', 'async')
      token.attrSet('loading', cover ? 'eager' : 'lazy')
      if (cover) {
        token.attrSet('fetchpriority', 'high')
      }
      if (remoteDimensions) {
        token.attrSet('width', String(remoteDimensions.width))
        token.attrSet('height', String(remoteDimensions.height))
      } else if (/(?:^|\/)cover-[^/?#]+/i.test(src)) {
        token.attrSet('width', '1200')
        token.attrSet('height', '675')
      }
      return defaultImage(tokens, index, options, env, self)
    }
  },
})

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
    ['link', { rel: 'icon', href: '/sellvpn-logo.svg', type: 'image/svg+xml' }],
  ],
  markdown: {
    links: {
      externalAttrs: {
        target: '_blank',
        rel: 'nofollow noopener noreferrer',
      },
    },
  },
  plugins: [seoMarkdownPlugin()],
  theme: plumeTheme({
    home: '/',
    hostname: siteUrl,
    blogText: '所有文章',
    tagText: '文章标签',
    archiveText: '文章归档',
    categoryText: '文章分类',
    footer: { message: '© Sell VPN · 信息整理、测评方法与风险提示' },
    contributors: false,

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
      {
        text: '关于本站',
        items: [
          { text: '关于 Sell VPN', link: '/about/' },
          { text: '编辑政策', link: '/editorial-policy/' },
          { text: '测评方法', link: '/review-methodology/' },
          { text: '联盟披露', link: '/affiliate-disclosure/' },
          { text: '隐私说明', link: '/privacy/' },
          { text: '联系与纠错', link: '/article/w4q5524n/' },
        ],
      },
    ],
    profile: {
      name: siteName,
      description: '机场测评、VPN 推荐与科学上网教程',
      avatar: '/sellvpn-logo.svg',
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
        modifyTimeGetter: (page) => latestISOString(
          page.frontmatter.updateTime,
          page.data.git?.updatedTime,
          page.frontmatter.date,
          page.frontmatter.createTime,
        ),
      },
      seo: {
        canonical: siteUrl,
        author: {
          name: siteName,
          url: authorUrl,
        },
        fallBackImage: `${siteUrl}/cover-airport-ranking-2026.jpg`,
        isArticle: (page) => Boolean(
          page.filePathRelative
          && page.frontmatter.article !== false
          && page.path !== '/'
          && page.path !== '/article/w4q5524n/',
        ),
        ogp: (ogp, page) => {
          const article = Boolean(
            page.filePathRelative
            && page.frontmatter.article !== false
            && page.path !== '/'
            && page.path !== '/article/w4q5524n/',
          )
          const title = String(ogp['og:title'] || page.title || siteName)
          const description = String(ogp['og:description'] || page.frontmatter.description || siteDescription)
          const image = String(ogp['og:image'] || `${siteUrl}/cover-airport-ranking-2026.jpg`)
          const result = {
            ...ogp,
            'og:site_name': siteName,
            'og:locale': 'zh_CN',
            'og:image': image,
            'og:image:alt': title,
            'twitter:card': 'summary_large_image',
            'twitter:title': title,
            'twitter:description': description,
            'twitter:image': image,
            'twitter:image:src': image,
            'twitter:image:alt': title,
          }

          if (article) {
            const modified = latestISOString(
              page.frontmatter.updateTime,
              ogp['og:updated_time'],
              page.data.git?.updatedTime,
              page.frontmatter.date,
              page.frontmatter.createTime,
            )
            result['article:author'] = authorUrl
            result['article:published_time'] = toISOString(page.frontmatter.createTime || page.frontmatter.date)
            result['article:modified_time'] = modified
            result['og:updated_time'] = modified
          } else {
            delete result['article:author']
            delete result['article:tag']
            delete result['article:published_time']
            delete result['article:modified_time']
            delete result['og:updated_time']
          }

          return result
        },
        customHead: (head, page) => {
          const robots =
            page.path === '/404.html'
              ? 'noindex, nofollow'
              : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

          head.unshift(['meta', { name: 'robots', content: robots }])

          if (page.path !== '/' && page.path !== '/404.html') {
            head.unshift([
              'script',
              { type: 'application/ld+json' },
              JSON.stringify(breadcrumbJsonLd(page)),
            ])
          }

          if (page.path === '/') {
            head.unshift([
              'script',
              { type: 'application/ld+json' },
              JSON.stringify({
                '@context': 'https://schema.org',
                ...organization,
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'editorial corrections',
                  url: `${siteUrl}/article/w4q5524n/`,
                },
              }),
            ])
            head.unshift([
              'script',
              { type: 'application/ld+json' },
              JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': websiteId,
                name: siteName,
                url: siteUrl,
                publisher: { '@id': organizationId },
                inLanguage: 'zh-CN',
              }),
            ])
          }
        },
        jsonLd: (jsonLD, page) => {
          if ('@type' in jsonLD && jsonLD['@type'] === 'Article') {
            const datePublished = toISOString(page.frontmatter.createTime || page.frontmatter.date)
            const dateModified = latestISOString(
              page.frontmatter.updateTime,
              jsonLD.dateModified,
              page.data.git?.updatedTime,
              page.frontmatter.date,
              page.frontmatter.createTime,
            )

            return {
              ...jsonLD,
              ...(datePublished ? { datePublished } : {}),
              ...(dateModified ? { dateModified } : {}),
              ...(page.frontmatter.description ? { description: page.frontmatter.description } : {}),
              author: [editorialAuthor],
              publisher: organization,
              inLanguage: 'zh-CN',
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${siteUrl}${page.path}`,
              },
            }
          }

          if (page.path === '/') {
            return {
              ...jsonLD,
              '@id': `${siteUrl}/#webpage`,
              url: siteUrl,
              isPartOf: { '@id': websiteId },
              publisher: { '@id': organizationId },
              inLanguage: 'zh-CN',
            }
          }

          return {
            ...jsonLD,
            '@id': `${siteUrl}${page.path}#webpage`,
            url: `${siteUrl}${page.path}`,
            isPartOf: { '@id': websiteId },
            publisher: { '@id': organizationId },
            inLanguage: 'zh-CN',
          }
        },
      },
    },
    markdown: {
      collapse: true,
    },
    blog: {
      tags: true,
      tagsTheme: 'brand',
      categories: true,
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
