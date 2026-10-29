import fs from 'node:fs'
import path from 'node:path'

const distDir = path.join(process.cwd(), 'docs', '.vuepress', 'dist')
const publicDir = path.join(process.cwd(), 'docs', '.vuepress', 'public')
const siteUrl = 'https://sellvpn.net'
const siteHostPattern = /^https?:\/\/(?:www\.)?sellvpn\.net(?=[:/]|$)/i
const siteDescription =
  'Sell VPN 整理 2026 最新机场推荐、VPN 推荐、机场测评、优惠信息、科学上网教程与购买风险提示。'
const websiteRoutes = new Set(['/', '/blog/', '/blog/tags/', '/blog/categories/', '/blog/archives/'])
const pageSeoOverrides = new Map([
  [
    '/blog/',
    {
      heading: '所有文章',
      title: '所有文章｜2026机场推荐、机场测评与科学上网教程 | Sell VPN',
      description:
        'Sell VPN 所有文章列表，汇总2026最新机场推荐、各大机场优惠码、机场测评、VPN推荐、科学上网教程、Clash Mi与Shadowrocket配置指南。',
    },
  ],
  [
    '/blog/tags/',
    {
      heading: '按标签浏览文章',
      title: '文章标签｜机场推荐、机场测评、科学上网与客户端教程 | Sell VPN',
      description:
        'Sell VPN 文章标签页，按机场推荐、机场优惠码、机场测评、科学上网、Clash教程、ChatGPT节点和流媒体解锁等标签浏览内容。',
    },
  ],
  [
    '/blog/archives/',
    {
      heading: '文章更新归档',
      title: '文章归档｜2026机场推荐与科学上网教程更新记录 | Sell VPN',
      description:
        'Sell VPN 文章归档页，按时间查看2026机场推荐、各大机场优惠码、机场测评、科学上网教程和客户端配置指南的更新记录。',
    },
  ],
  [
    '/blog/categories/',
    {
      heading: '按分类浏览文章',
      title: '文章分类｜机场推荐、机场测评与科学上网教程 | Sell VPN',
      description:
        '按机场推荐、机场测评、科学上网教程和AI工具教程分类浏览 Sell VPN 的文章、使用指南、优惠信息与风险提示。',
    },
  ],
])

const affiliateHostFragments = [
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
const knownPriorityImages = new Set([
  'https://image.ermao.net/images/blog/clashmi/20260305_103545-57abfa.png',
])
const imageSizeCache = new Map()

const walk = (dir, predicate = () => true) => {
  const entries = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      entries.push(...walk(file, predicate))
    } else if (predicate(file)) {
      entries.push(file)
    }
  }

  return entries
}

const isAffiliateUrl = (href) => {
  const normalized = href.toLowerCase()

  if (/[?&#](?:aff|affid|affiliate|code|invite|ref|referral|r)=/i.test(normalized)) return true
  if (affiliateHostFragments.some((fragment) => normalized.includes(fragment))) return true

  try {
    const hostname = new URL(href).hostname.toLowerCase()
    return affiliateHostFragments.some((fragment) => hostname === fragment || hostname.endsWith(`.${fragment}`))
  } catch {
    return false
  }
}

const addLinkRelations = (tag) => {
  const href = tag.match(/\bhref="([^"]+)"/i)?.[1] || ''

  if (!/^https?:\/\//i.test(href) || siteHostPattern.test(href)) return tag

  const affiliate = isAffiliateUrl(href)
  const values = new Set(['noopener'])

  if (/\brel="/i.test(tag)) {
    return tag.replace(/\brel="([^"]*)"/i, (_match, rel) => {
      for (const value of String(rel).split(/\s+/).filter(Boolean)) values.add(value)
      if (affiliate) {
        values.add('nofollow')
        values.add('sponsored')
      } else {
        values.delete('nofollow')
        values.delete('sponsored')
      }
      return `rel="${[...values].join(' ')}"`
    })
  }

  if (affiliate) {
    values.add('nofollow')
    values.add('sponsored')
  }
  return tag.replace(/<a\b/i, `<a rel="${[...values].join(' ')}"`)
}

const getImageDimensionsFromBuffer = (buffer, extension) => {
  if (extension === '.png' && buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  }

  if ((extension === '.jpg' || extension === '.jpeg') && buffer.length >= 4) {
    let offset = 2
    const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])

    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1
        continue
      }

      const marker = buffer[offset + 1]
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2
        continue
      }

      const segmentLength = buffer.readUInt16BE(offset + 2)
      if (segmentLength < 2 || offset + segmentLength + 2 > buffer.length) break
      if (startOfFrameMarkers.has(marker)) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        }
      }
      offset += segmentLength + 2
    }
  }

  if (extension === '.gif' && buffer.length >= 10) {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) }
  }

  if (extension === '.svg') {
    const source = buffer.toString('utf8', 0, Math.min(buffer.length, 8192))
    const viewBox = source.match(/\bviewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i)
    const width = source.match(/\bwidth=["']([\d.]+)(?:px)?["']/i)?.[1]
    const height = source.match(/\bheight=["']([\d.]+)(?:px)?["']/i)?.[1]
    if (width && height) return { width: Math.round(Number(width)), height: Math.round(Number(height)) }
    if (viewBox) return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) }
  }

  return null
}

const getLocalImageDimensions = (src) => {
  if (knownRemoteImageDimensions.has(src)) return knownRemoteImageDimensions.get(src)

  let pathname = src

  try {
    if (/^https?:\/\//i.test(src)) {
      const url = new URL(src)
      if (!/(?:^|\.)sellvpn\.net$/i.test(url.hostname)) return null
      pathname = url.pathname
    }
  } catch {
    return null
  }

  if (!pathname.startsWith('/')) return null
  pathname = decodeURIComponent(pathname.split(/[?#]/)[0])

  const candidates = [
    path.join(publicDir, pathname.slice(1)),
    path.join(distDir, pathname.slice(1)),
  ]

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    if (!resolved.startsWith(`${path.resolve(publicDir)}${path.sep}`) && !resolved.startsWith(`${path.resolve(distDir)}${path.sep}`)) continue
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) continue
    if (imageSizeCache.has(resolved)) return imageSizeCache.get(resolved)

    const dimensions = getImageDimensionsFromBuffer(fs.readFileSync(resolved), path.extname(resolved).toLowerCase())
    imageSizeCache.set(resolved, dimensions)
    return dimensions
  }

  return null
}

const setTagAttribute = (tag, name, value, overwrite = false) => {
  const pattern = new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*')`, 'i')
  if (pattern.test(tag)) {
    return overwrite ? tag.replace(pattern, ` ${name}="${value}"`) : tag
  }
  return tag.replace(/\s*\/?>(?=$)/, ` ${name}="${value}">`)
}

const removeTagAttribute = (tag, name) =>
  tag.replace(new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*')`, 'gi'), '')

const isPriorityImage = (src) =>
  /(?:^|\/)cover-[^/?#]+/i.test(src) || knownPriorityImages.has(src)

const optimizeImageTag = (tag, priority = false) => {
  const src = tag.match(/\bsrc="([^"]+)"/i)?.[1] || ''
  const dimensions = getLocalImageDimensions(src)
  const eager = priority || /sellvpn-logo\.svg/i.test(src)
  let result = setTagAttribute(tag, 'decoding', 'async')
  result = setTagAttribute(result, 'loading', eager ? 'eager' : 'lazy', true)
  result = priority
    ? setTagAttribute(result, 'fetchpriority', 'high', true)
    : removeTagAttribute(result, 'fetchpriority')
  if (dimensions) {
    result = setTagAttribute(result, 'width', dimensions.width)
    result = setTagAttribute(result, 'height', dimensions.height)
  }
  return result
}

const routeFromHtmlFile = (file) => {
  const rel = path.relative(distDir, file).replaceAll(path.sep, '/')

  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return `/${rel.replace(/\/index\.html$/, '/')}`

  return `/${rel}`
}

const escapeAttribute = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const upsertMetaName = (html, name, content) => {
  const escaped = escapeAttribute(content)
  const meta = `<meta name="${name}" content="${escaped}">`
  const pattern = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`, 'i')

  if (pattern.test(html)) return html.replace(pattern, meta)
  return html.replace('</head>', `${meta}</head>`)
}

const ensureMetaName = (html, name, content) =>
  new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`, 'i').test(html)
    ? html
    : upsertMetaName(html, name, content)

const upsertMetaProperty = (html, property, content) => {
  const escaped = escapeAttribute(content)
  const meta = `<meta property="${property}" content="${escaped}">`
  const pattern = new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*/?>`, 'i')

  if (pattern.test(html)) return html.replace(pattern, meta)
  return html.replace('</head>', `${meta}</head>`)
}

const ensureMetaProperty = (html, property, content) =>
  new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*/?>`, 'i').test(html)
    ? html
    : upsertMetaProperty(html, property, content)

const getTitle = (html) => html.match(/<title>([^<]*)<\/title>/i)?.[1] || 'Sell VPN'

const getMetaNameContent = (html, name) =>
  html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"\\s*/?>`, 'i'))?.[1] || ''

const getMetaPropertyContent = (html, property) =>
  html.match(new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]*)"\\s*/?>`, 'i'))?.[1] || ''

const removeMetaName = (html, name) =>
  html.replace(new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`, 'gi'), '')

const upsertCanonical = (html, route) => {
  if (route === '/404.html') {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi, '')
  }

  const canonical = `<link rel="canonical" href="${siteUrl}${route}">`

  if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonical)
  }

  return html.replace('</head>', `${canonical}</head>`)
}

const replaceTitle = (html, title) =>
  /<title>[^<]*<\/title>/i.test(html)
    ? html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
    : html.replace('</head>', `<title>${title}</title></head>`)

const decodeHtmlText = (value) => String(value)
  .replace(/<!--([\s\S]*?)-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/\s+/g, ' ')
  .trim()

const extractPostItems = (html) => {
  const items = []
  const seen = new Set()

  const addItem = (href, rawName) => {
    const name = decodeHtmlText(rawName)
    if (!href.startsWith('/') || !name || seen.has(href)) return

    seen.add(href)
    items.push({ href, name })
  }

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attributes = match[1]
    const className = attributes.match(/\bclass=(?:"([^"]*)"|'([^']*)')/i)?.slice(1).find(Boolean) || ''
    if (!/(?:^|\s)post-link(?:\s|$)/i.test(className)) continue

    const href = attributes.match(/\bhref=(?:"([^"]+)"|'([^']+)')/i)?.slice(1).find(Boolean) || ''
    addItem(href, match[2])
  }

  for (const match of html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)) {
    const anchor = match[1].match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i)
    if (!anchor) continue

    const href = anchor[1].match(/\bhref=(?:"([^"]+)"|'([^']+)')/i)?.slice(1).find(Boolean) || ''
    addItem(href, anchor[2])
  }

  return items
}

const upsertCollectionJsonLd = (html, route, override) => {
  const postItems = extractPostItems(html)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}${route}#webpage`,
    url: `${siteUrl}${route}`,
    name: override.heading,
    description: override.description,
    inLanguage: 'zh-CN',
    isPartOf: { '@id': `${siteUrl}/#website` },
    breadcrumb: {
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
          name: override.heading,
          item: `${siteUrl}${route}`,
        },
      ],
    },
    ...(postItems.length > 0
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: postItems.length,
            itemListElement: postItems.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${siteUrl}${item.href}`,
              name: item.name,
            })),
          },
        }
      : {}),
  }
  const json = JSON.stringify(schema).replaceAll('<', '\\u003c')
  const script = `<script type="application/ld+json" data-seo-schema="collection">${json}</script>`
  const pattern = /<script\s+type="application\/ld\+json"\s+data-seo-schema="collection">[\s\S]*?<\/script>/i

  return pattern.test(html)
    ? html.replace(pattern, script)
    : html.replace('</head>', `${script}</head>`)
}

const imageMimeType = (src) => {
  const pathname = String(src).split(/[?#]/)[0].toLowerCase()
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg'
  if (pathname.endsWith('.png')) return 'image/png'
  if (pathname.endsWith('.webp')) return 'image/webp'
  if (pathname.endsWith('.gif')) return 'image/gif'
  return ''
}

let updatedHtmlFiles = 0
let updatedLinks = 0
let sponsoredLinks = 0
let updatedImages = 0
let updatedSeoFiles = 0
let normalizedLlmsLinks = 0
let updatedSitemapRoutes = 0

for (const file of walk(distDir, (item) => item.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8')
  const route = routeFromHtmlFile(file)
  let priorityImageSelected = false
  let next = html.replace(/<a\b[^>]*\bhref="https?:\/\/[^"]+"[^>]*>/gi, (tag) => {
    const href = tag.match(/\bhref="([^"]+)"/i)?.[1] || ''
    const updated = addLinkRelations(tag)
    if (updated !== tag) {
      updatedLinks += 1
      if (isAffiliateUrl(href)) sponsoredLinks += 1
    }
    return updated
  })
  next = next.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/\bsrc="([^"]+)"/i)?.[1] || ''
    const priority = !priorityImageSelected && isPriorityImage(src)
    if (priority) priorityImageSelected = true
    const updated = optimizeImageTag(tag, priority)
    if (updated !== tag) updatedImages += 1
    return updated
  })
  next = removeMetaName(next, 'keywords')

  next = upsertMetaName(
    next,
    'robots',
    route === '/404.html'
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  )
  next = upsertCanonical(next, route)

  const override = pageSeoOverrides.get(route)

  if (override) {
    next = replaceTitle(next, override.title)
    next = upsertMetaName(next, 'description', override.description)
    next = upsertCollectionJsonLd(next, route, override)
  }

  if (route !== '/404.html') {
    next = upsertMetaProperty(next, 'og:url', `${siteUrl}${route}`)
    next = upsertMetaProperty(next, 'og:site_name', 'Sell VPN')
    next = upsertMetaProperty(next, 'og:title', getTitle(next).replace(/\s*\|\s*Sell VPN$/, ''))
    next = upsertMetaProperty(next, 'og:description', getMetaNameContent(next, 'description') || siteDescription)
    next = websiteRoutes.has(route)
      ? upsertMetaProperty(next, 'og:type', 'website')
      : ensureMetaProperty(next, 'og:type', 'article')
    next = upsertMetaProperty(next, 'og:locale', 'zh_CN')
    next = ensureMetaProperty(next, 'og:image', `${siteUrl}/cover-airport-ranking-2026.jpg`)

    const title = getTitle(next).replace(/\s*\|\s*Sell VPN$/, '')
    const description = getMetaNameContent(next, 'description') || siteDescription
    const socialImage = getMetaPropertyContent(next, 'og:image') || `${siteUrl}/cover-airport-ranking-2026.jpg`
    next = upsertMetaProperty(next, 'og:image:alt', title)
    next = upsertMetaName(next, 'twitter:card', 'summary_large_image')
    next = upsertMetaName(next, 'twitter:title', title)
    next = upsertMetaName(next, 'twitter:description', description)
    next = upsertMetaName(next, 'twitter:image', socialImage)
    next = upsertMetaName(next, 'twitter:image:alt', title)

    const mimeType = imageMimeType(socialImage)
    if (mimeType) next = ensureMetaProperty(next, 'og:image:type', mimeType)

    const dimensions = getLocalImageDimensions(socialImage)
    if (dimensions) {
      next = ensureMetaProperty(next, 'og:image:width', dimensions.width)
      next = ensureMetaProperty(next, 'og:image:height', dimensions.height)
    }
  }

  if (next !== html) {
    fs.writeFileSync(file, next)
    updatedHtmlFiles += 1
    updatedSeoFiles += 1
  }
}

const llmsFile = path.join(distDir, 'llms.txt')
if (fs.existsSync(llmsFile)) {
  const source = fs.readFileSync(llmsFile, 'utf8')
  const normalized = source.replace(
    /https:\/\/sellvpn\.net(\/[^\s)]*?)?\/index\.html/g,
    (_match, pathname = '') => `${siteUrl}${pathname || ''}/`,
  )
  normalizedLlmsLinks = (source.match(/https:\/\/sellvpn\.net(?:\/[^\s)]*?)?\/index\.html/g) || []).length
  if (normalized !== source) fs.writeFileSync(llmsFile, normalized)
}

const articleModifiedDates = []
for (const file of walk(distDir, (item) => item.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8')
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const queue = [JSON.parse(match[1])]
      while (queue.length > 0) {
        const schema = queue.shift()
        if (Array.isArray(schema)) {
          queue.push(...schema)
          continue
        }
        if (!schema || typeof schema !== 'object') continue
        if (Array.isArray(schema['@graph'])) queue.push(...schema['@graph'])
        const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']]
        if (types.includes('Article') && schema.dateModified) {
          const timestamp = new Date(schema.dateModified).getTime()
          if (!Number.isNaN(timestamp)) articleModifiedDates.push(timestamp)
        }
      }
    } catch {
      // The audit reports malformed JSON-LD with the page path; postbuild stays resilient.
    }
  }
}

const sitemapFile = path.join(distDir, 'sitemap.xml')
if (fs.existsSync(sitemapFile) && articleModifiedDates.length > 0) {
  const latestArticleUpdate = new Date(Math.max(...articleModifiedDates)).toISOString()
  let sitemap = fs.readFileSync(sitemapFile, 'utf8')

  for (const route of ['/blog/', '/blog/tags/', '/blog/categories/', '/blog/archives/']) {
    const loc = `${siteUrl}${route}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(<url>\\s*<loc>${loc}<\\/loc>)(?!\\s*<lastmod>)`)
    const next = sitemap.replace(pattern, `$1<lastmod>${latestArticleUpdate}</lastmod>`)
    if (next !== sitemap) updatedSitemapRoutes += 1
    sitemap = next
  }

  fs.writeFileSync(sitemapFile, sitemap)
}

fs.writeFileSync(
  path.join(distDir, 'robots.txt'),
  ['User-agent: *', 'Allow: /', 'Sitemap: https://sellvpn.net/sitemap.xml', ''].join('\n'),
)

console.log(
  `Postbuild SEO: updated ${updatedLinks} external links (${sponsoredLinks} sponsored) and ${updatedImages} images in ${updatedHtmlFiles} HTML files; normalized ${updatedSeoFiles} SEO heads and robots.txt.`,
)
console.log(
  `Postbuild discovery: normalized ${normalizedLlmsLinks} llms.txt links and added lastmod to ${updatedSitemapRoutes} aggregate sitemap routes.`,
)
