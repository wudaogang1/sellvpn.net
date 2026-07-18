import fs from 'node:fs'
import path from 'node:path'

const distDir = path.join(process.cwd(), 'docs', '.vuepress', 'dist')
const siteUrl = 'https://sellvpn.net'
const siteHostPattern = /^https?:\/\/(?:www\.)?sellvpn\.net/i
const defaultKeywords =
  '2026机场推荐,最新机场推荐,各大机场优惠码,机场优惠码,稳定机场推荐,便宜机场推荐,低价机场,VPN推荐,翻墙VPN,翻墙机场,科学上网,Clash Mi教程,Clash Verge教程,Shadowrocket教程,ChatGPT节点,ChatGPT机场推荐,YouTube加速,流媒体解锁,流媒体机场推荐,机场测速,机场避坑,机场防跑路'
const pageSeoOverrides = new Map([
  [
    '/blog/',
    {
      title: '所有文章｜2026机场推荐、机场测评与科学上网教程 | Sell VPN',
      description:
        'Sell VPN 所有文章列表，汇总2026最新机场推荐、各大机场优惠码、机场测评、VPN推荐、科学上网教程、Clash Mi与Shadowrocket配置指南。',
      keywords: `${defaultKeywords},所有文章,机场测评汇总,科学上网文章,客户端教程`,
    },
  ],
  [
    '/blog/tags/',
    {
      title: '文章标签｜机场推荐、机场测评、科学上网与客户端教程 | Sell VPN',
      description:
        'Sell VPN 文章标签页，按机场推荐、机场优惠码、机场测评、科学上网、Clash教程、ChatGPT节点和流媒体解锁等标签浏览内容。',
      keywords: `${defaultKeywords},文章标签,机场标签,科学上网标签`,
    },
  ],
  [
    '/blog/archives/',
    {
      title: '文章归档｜2026机场推荐与科学上网教程更新记录 | Sell VPN',
      description:
        'Sell VPN 文章归档页，按时间查看2026机场推荐、各大机场优惠码、机场测评、科学上网教程和客户端配置指南的更新记录。',
      keywords: `${defaultKeywords},文章归档,机场文章归档,更新记录`,
    },
  ],
])

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

const addNofollow = (tag) => {
  const href = tag.match(/\bhref="([^"]+)"/i)?.[1] || ''

  if (!/^https?:\/\//i.test(href) || siteHostPattern.test(href)) return tag

  if (/\brel="/i.test(tag)) {
    return tag.replace(/\brel="([^"]*)"/i, (_match, rel) => {
      const values = new Set(String(rel).split(/\s+/).filter(Boolean))
      values.add('nofollow')
      return `rel="${[...values].join(' ')}"`
    })
  }

  return tag.replace(/<a\b/i, '<a rel="nofollow"')
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

const upsertCanonical = (html, route) => {
  if (route === '/404.html') return html

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

let updatedHtmlFiles = 0
let updatedLinks = 0
let updatedSeoFiles = 0

for (const file of walk(distDir, (item) => item.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8')
  const route = routeFromHtmlFile(file)
  let next = html.replace(/<a\b[^>]*\bhref="https?:\/\/[^"]+"[^>]*>/gi, (tag) => {
    const updated = addNofollow(tag)
    if (updated !== tag) updatedLinks += 1
    return updated
  })

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
    next = upsertMetaName(next, 'keywords', override.keywords)
  } else {
    next = ensureMetaName(next, 'keywords', defaultKeywords)
  }

  if (route !== '/404.html') {
    next = ensureMetaProperty(next, 'og:url', `${siteUrl}${route}`)
    next = ensureMetaProperty(next, 'og:site_name', 'Sell VPN')
    next = ensureMetaProperty(next, 'og:title', getTitle(next).replace(/\s*\|\s*Sell VPN$/, ''))
    next = ensureMetaProperty(next, 'og:description', getMetaNameContent(next, 'description') || defaultKeywords)
    next = ensureMetaProperty(next, 'og:type', route === '/' || route === '/blog/' ? 'website' : 'article')
    next = ensureMetaProperty(next, 'og:locale', 'zh-CN')
  }

  if (next !== html) {
    fs.writeFileSync(file, next)
    updatedHtmlFiles += 1
    updatedSeoFiles += 1
  }
}

fs.writeFileSync(
  path.join(distDir, 'robots.txt'),
  ['User-agent: *', 'Allow: /', 'Sitemap: https://sellvpn.net/sitemap.xml', ''].join('\n'),
)

console.log(
  `Postbuild SEO: updated ${updatedLinks} external links in ${updatedHtmlFiles} HTML files, normalized ${updatedSeoFiles} SEO heads and robots.txt.`,
)
