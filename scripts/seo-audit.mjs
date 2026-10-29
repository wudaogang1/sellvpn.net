import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const vuepressDir = path.join(docsDir, '.vuepress')
const publicDir = path.join(vuepressDir, 'public')
const distDir = path.join(vuepressDir, 'dist')
const postbuildFile = path.join(root, 'scripts', 'postbuild-seo.mjs')
const configFile = path.join(vuepressDir, 'config.ts')
const siteUrl = 'https://sellvpn.net'
const siteHostPattern = /^(?:www\.)?sellvpn\.net$/i
const generatedRoutes = new Set([
  '/blog/',
  '/blog/tags/',
  '/blog/categories/',
  '/blog/archives/',
])
const generatedRouteHeadings = new Map([
  ['/blog/', '所有文章'],
  ['/blog/tags/', '按标签浏览文章'],
  ['/blog/categories/', '按分类浏览文章'],
  ['/blog/archives/', '文章更新归档'],
])
const expectedCategoryNames = ['机场推荐', '机场测评', '科学上网教程', 'AI工具教程']
const focusTopicRoutes = new Map([
  ['机场', '/posts/vpn-airport-ranking-2026/'],
  ['VPN', '/blog/vpn-vs-airport/'],
  ['翻墙', '/posts/jieshao/'],
  ['加速器', '/posts/accelerator-vpn-ladder-difference/'],
])
const affiliateHostFragments = [
  '99ba.net',
  'bianyuanjiediantttt.xyz',
  'cocoduck.live',
  'cpdd.one',
  'edgenovaaff.com',
  'fb7777.shop',
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
  '1flyunaff.cc',
]

const issues = []
const warnings = []

const walk = (dir, predicate = () => true) => {
  if (!fs.existsSync(dir)) return []

  const entries = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) entries.push(...walk(file, predicate))
    else if (predicate(file)) entries.push(file)
  }
  return entries
}

const markdownFiles = walk(
  docsDir,
  (file) => file.endsWith('.md') && !file.includes(`${path.sep}.vuepress${path.sep}`),
)

const publicFiles = walk(publicDir).map(
  (file) => `/${path.relative(publicDir, file).replaceAll(path.sep, '/')}`,
)
const publicAssets = new Set(publicFiles)

const parseFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  const raw = match?.[1] ?? ''
  const data = {}

  for (const line of raw.split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (field) data[field[1]] = field[2].trim().replace(/^['"]|['"]$/g, '')
  }

  return {
    data,
    raw,
    body: match ? content.slice(match[0].length) : content,
  }
}

const normalizeRoute = (route) => {
  if (!route || route === '/') return route || ''

  const clean = route
    .replace(/^https?:\/\/(?:www\.)?sellvpn\.net/i, '')
    .split(/[?#]/)[0]

  if (!clean.startsWith('/')) return ''
  if (path.posix.extname(clean)) return clean
  return clean.endsWith('/') ? clean : `${clean}/`
}

const parseSeoDate = (value) => {
  if (!value) return null
  let normalized = String(value).trim().replace(/\//g, '-')
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    normalized = `${normalized}T00:00:00.000Z`
  } else if (
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(normalized)
  ) {
    normalized = `${normalized.replace(' ', 'T')}Z`
  }
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const dateField = (page, field) => {
  if (!page.data[field]) return null
  const date = parseSeoDate(page.data[field])
  if (!date) issues.push(`${page.rel}: invalid ${field}: ${page.data[field]}`)
  return date
}

const normalizeHref = (href) =>
  String(href)
    .trim()
    .replace(/^<|>$/g, '')
    .replaceAll('&amp;', '&')

const isAffiliateUrl = (href) => {
  const normalized = normalizeHref(href)
  if (!/^https?:\/\//i.test(normalized)) return false

  try {
    const url = new URL(normalized)
    return (
      affiliateHostFragments.some(
        (fragment) => url.hostname === fragment || url.hostname.endsWith(`.${fragment}`),
      ) ||
      /(?:^|[.-])(?:aff|affiliate|vipaff)(?:[.-]|$)/i.test(url.hostname) ||
      /[?&#](?:aff|affiliate|affid|ref|referral|invite|inviter|r|code)=/i.test(normalized) ||
      /\/(?:register|signup)(?:[/?#]|$).*?[?&#](?:code|aff|ref|r)=/i.test(normalized)
    )
  } catch {
    return false
  }
}

const markdownLinkPattern = /(!?)\[([^\]]*)\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^"']*["'])?\s*\)/g
const rawAnchorPattern = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>/gi

const routeOwners = new Map()
const pages = markdownFiles.map((file) => {
  const content = fs.readFileSync(file, 'utf8')
  const { data, body } = parseFrontmatter(content)
  const rel = path.relative(root, file)
  const isHome = data.home === 'true' || file === path.join(docsDir, 'index.md')
  const route = isHome ? '/' : normalizeRoute(data.permalink)
  const isArticle =
    !isHome &&
    data.article !== 'false' &&
    route !== '/article/w4q5524n/'

  if (route) {
    const owners = routeOwners.get(route) || []
    owners.push(rel)
    routeOwners.set(route, owners)
  }

  return { file, rel, content, body, data, isHome, isArticle, route }
})

const routePaths = new Set([...routeOwners.keys(), ...generatedRoutes])
const configSource = fs.readFileSync(configFile, 'utf8')
const homePage = pages.find((page) => page.isHome)

for (const [topic, expectedRoute] of focusTopicRoutes) {
  const owners = pages.filter((page) => page.data.seoFocus === topic)
  if (owners.length !== 1) {
    issues.push(`SEO focus ${topic}: expected exactly one owner, found ${owners.length}`)
    continue
  }

  const owner = owners[0]
  if (owner.route !== expectedRoute) {
    issues.push(`SEO focus ${topic}: expected ${expectedRoute}, found ${owner.route || 'no route'}`)
  }

  const topicPattern = new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  if (!topicPattern.test(owner.data.title || '')) {
    issues.push(`${owner.rel}: SEO focus ${topic} is missing from title`)
  }
  if (!topicPattern.test(owner.data.description || '')) {
    issues.push(`${owner.rel}: SEO focus ${topic} is missing from description`)
  }
  if (!topicPattern.test(owner.body)) {
    issues.push(`${owner.rel}: SEO focus ${topic} is missing from visible content`)
  }

  const inboundSources = pages.filter(
    (page) => page.route !== expectedRoute && page.content.includes(expectedRoute),
  )
  if (inboundSources.length < 2) {
    issues.push(`SEO focus ${topic}: only ${inboundSources.length} source page(s) link to ${expectedRoute}`)
  }
  if (!homePage?.content.includes(expectedRoute)) {
    issues.push(`SEO focus ${topic}: homepage does not link to ${expectedRoute}`)
  }
  if (!configSource.includes(expectedRoute)) {
    issues.push(`SEO focus ${topic}: global navigation does not link to ${expectedRoute}`)
  }
}

for (const [route, owners] of routeOwners) {
  if (owners.length > 1) {
    issues.push(`duplicate permalink ${route}: ${owners.join(', ')}`)
  }
}

const resolveInternalTarget = (page, href) => {
  const normalized = normalizeHref(href)
  if (/^https?:\/\//i.test(normalized)) {
    const url = new URL(normalized)
    if (!siteHostPattern.test(url.hostname)) return null
    return `${url.pathname}${url.search}${url.hash}`
  }

  if (normalized.startsWith('/')) return normalized
  if (normalized.startsWith('#')) return normalized

  if (normalized.endsWith('.md') || normalized.includes('.md#')) {
    const filePart = normalized.split(/[?#]/)[0]
    return { markdownFile: path.resolve(path.dirname(page.file), decodeURIComponent(filePart)) }
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(normalized)) return null
  if (!page.route) return null
  return new URL(normalized, `${siteUrl}${page.route}`).pathname
}

const affiliatePages = []

for (const page of pages) {
  const { data, rel, body, isHome, isArticle } = page
  const h1Count = (body.match(/^# /gm) ?? []).length

  if (!data.title) issues.push(`${rel}: missing title`)
  if (!data.description) issues.push(`${rel}: missing description`)
  if (!isHome && !data.permalink) issues.push(`${rel}: missing permalink`)
  if (isArticle && !data.createTime && !data.date) {
    issues.push(`${rel}: article needs createTime or date`)
  }
  if (h1Count > 0) {
    issues.push(`${rel}: markdown body has ${h1Count} H1 heading(s); use H2+ under the page title`)
  }
  if (page.content.includes('ccc.jichang.best')) {
    issues.push(`${rel}: contains the retired ccc.jichang.best host`)
  }

  if (data.title && [...data.title].length > 80) {
    warnings.push(`${rel}: title is longer than 80 characters`)
  }

  if (data.description) {
    const length = [...data.description].length
    if (length < 50) warnings.push(`${rel}: description is shorter than 50 characters`)
    if (length > 180) warnings.push(`${rel}: description is longer than 180 characters`)
  }

  const createTime = dateField(page, 'createTime')
  const displayDate = dateField(page, 'date')
  const updateTime = dateField(page, 'updateTime')

  if (createTime && displayDate && createTime > displayDate) {
    issues.push(`${rel}: date is earlier than createTime`)
  }
  if (createTime && updateTime && createTime > updateTime) {
    issues.push(`${rel}: updateTime is earlier than createTime`)
  }
  if (displayDate && updateTime && displayDate > updateTime) {
    issues.push(`${rel}: updateTime is earlier than date`)
  }

  const visibleUpdate = body.match(
    /更新时间[：:]\s*(?:\*\*)?(\d{4})年(\d{1,2})月(?:(\d{1,2})日)?/,
  )
  if (visibleUpdate && updateTime) {
    const [, year, month, day] = visibleUpdate
    const sameVisibleDate =
      updateTime.getUTCFullYear() === Number(year) &&
      updateTime.getUTCMonth() + 1 === Number(month) &&
      (!day || updateTime.getUTCDate() === Number(day))
    if (!sameVisibleDate) issues.push(`${rel}: visible update date disagrees with updateTime`)
  } else if (visibleUpdate && isArticle && !data.updateTime) {
    warnings.push(`${rel}: visible update date has no explicit updateTime frontmatter`)
  }

  if (data.cover?.startsWith('/')) {
    const cover = data.cover.split(/[?#]/)[0]
    if (!publicAssets.has(cover)) issues.push(`${rel}: cover asset not found: ${data.cover}`)
  }

  const bodyWithoutCode = body.replace(/```[\s\S]*?```/g, '')
  const links = []
  const images = []

  for (const match of bodyWithoutCode.matchAll(markdownLinkPattern)) {
    const entry = {
      href: normalizeHref(match[3]),
      label: match[2].trim(),
      raw: match[0],
      isImage: match[1] === '!',
    }
    if (entry.isImage) images.push(entry)
    else links.push(entry)
  }

  for (const match of bodyWithoutCode.matchAll(rawAnchorPattern)) {
    const relValue = match[0].match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2] || ''
    links.push({
      href: normalizeHref(match[2]),
      label: '(raw HTML anchor)',
      raw: match[0],
      isImage: false,
      sourceRel: new Set(relValue.toLowerCase().split(/\s+/).filter(Boolean)),
    })
  }

  for (const image of images) {
    if (!image.label) issues.push(`${rel}: image is missing alt text: ${image.raw}`)
    if (!image.href) {
      issues.push(`${rel}: image has an empty destination`)
      continue
    }

    if (image.href.startsWith('/')) {
      const asset = image.href.split(/[?#]/)[0]
      if (!publicAssets.has(asset)) issues.push(`${rel}: image asset not found: ${image.href}`)
    }
  }

  for (const match of bodyWithoutCode.matchAll(/<img\b[^>]*>/gi)) {
    const alt = match[0].match(/\balt\s*=\s*(["'])(.*?)\1/i)?.[2].trim()
    if (!alt) issues.push(`${rel}: raw HTML image is missing alt text: ${match[0]}`)
  }

  const paidLinks = links.filter((link) => isAffiliateUrl(link.href))
  const paidBareUrls = [...bodyWithoutCode.matchAll(/https?:\/\/[^\s<>)]+/gi)]
    .map((match) => match[0])
    .filter(isAffiliateUrl)

  if (paidLinks.length > 0 || paidBareUrls.length > 0) {
    affiliatePages.push(page)
    if (!/联盟披露/.test(bodyWithoutCode)) {
      issues.push(`${rel}: affiliate link present without an “联盟披露” statement`)
    }
  }

  for (const link of links) {
    if (!link.label) issues.push(`${rel}: link has empty anchor text: ${link.raw}`)
    if (!link.href) {
      issues.push(`${rel}: link has an empty destination`)
      continue
    }

    if (/^https?:\/\//i.test(link.href)) {
      let url
      try {
        url = new URL(link.href)
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol')
        if (/^(?:example\.(?:com|org|net)|localhost)$/i.test(url.hostname)) {
          issues.push(`${rel}: placeholder external link: ${link.href}`)
        }
        if (url.protocol === 'http:') warnings.push(`${rel}: external link still uses HTTP: ${link.href}`)
      } catch {
        issues.push(`${rel}: invalid external URL: ${link.href}`)
        continue
      }
      if (!siteHostPattern.test(url.hostname)) continue
    }

    if (/^(?:mailto:|tel:)/i.test(link.href)) continue
    if (/^(?:javascript|data):/i.test(link.href)) {
      issues.push(`${rel}: unsafe link protocol: ${link.href}`)
      continue
    }

    const target = resolveInternalTarget(page, link.href)
    if (!target || target === link.href && link.href.startsWith('#')) continue

    if (typeof target === 'object') {
      if (!fs.existsSync(target.markdownFile)) {
        issues.push(`${rel}: linked Markdown file not found: ${link.href}`)
      }
      continue
    }

    const clean = target.split(/[?#]/)[0]
    if (!clean || clean === '/') continue
    if (path.posix.extname(clean)) {
      if (!publicAssets.has(clean)) issues.push(`${rel}: linked asset not found: ${link.href}`)
      continue
    }

    const route = normalizeRoute(clean)
    if (!routePaths.has(route)) issues.push(`${rel}: internal link target not found: ${link.href}`)
  }

  for (const line of bodyWithoutCode.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (/^(?:👉\s*)?\(https?:\/\/[^\s)]+\)[。.]?$/.test(trimmed)) {
      issues.push(`${rel}: URL is parenthesized text instead of a Markdown link: ${trimmed}`)
    }
    if (/^https?:\/\/[^\s<>]+[。.]?$/.test(trimmed)) {
      issues.push(`${rel}: bare URL should use descriptive Markdown anchor text: ${trimmed}`)
    }

    const withoutValidLinks = line.replace(markdownLinkPattern, '')
    if (/!?\[[^\]]*\]\([^)]*$/.test(withoutValidLinks)) {
      issues.push(`${rel}: malformed or unclosed Markdown link: ${trimmed}`)
    }
    if (/!?\[[^\]]*\]\(\s*\)/.test(line)) {
      issues.push(`${rel}: Markdown link has an empty destination: ${trimmed}`)
    }
  }
}

if (!publicAssets.has('/robots.txt')) {
  issues.push('docs/.vuepress/public/robots.txt is missing')
}
if (publicAssets.has('/robot.txt')) {
  issues.push('docs/.vuepress/public/robot.txt should be renamed to robots.txt')
}

const hasAboutPage = routePaths.has('/about/')
if (!hasAboutPage) issues.push('global author page is missing at /about/')

const authorSourceFiles = walk(path.join(vuepressDir, 'theme'), (file) =>
  /\.(?:vue|ts|js)$/.test(file),
)
const authorSource = authorSourceFiles
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n')
if (
  !/Sell VPN/.test(authorSource) ||
  !/(?:href=["']\/about\/|authorUrl)/.test(authorSource) ||
  !/schema\.org\/Organization/.test(authorSource)
) {
  issues.push('global visible author must identify Sell VPN as an Organization and link to /about/')
}

const postbuildSource = fs.existsSync(postbuildFile) ? fs.readFileSync(postbuildFile, 'utf8') : ''
const hasGeneratedPaidLinkPolicy =
  /sponsored/.test(postbuildSource) &&
  /nofollow/.test(postbuildSource) &&
  /noopener/.test(postbuildSource) &&
  /(?:affiliate|affiliat|推广|commercial)/i.test(postbuildSource)

const everyRawPaidLinkIsMarked = affiliatePages.every((page) => {
  const rawLinks = [...page.body.matchAll(rawAnchorPattern)]
    .filter((match) => isAffiliateUrl(match[2]))
    .map((match) => new Set(
      (match[0].match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2] || '')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    ))
  const hasMarkdownPaidLink = [...page.body.matchAll(markdownLinkPattern)]
    .some((match) => match[1] !== '!' && isAffiliateUrl(match[3]))
  return !hasMarkdownPaidLink && rawLinks.every(
    (values) => ['sponsored', 'nofollow', 'noopener'].every((value) => values.has(value)),
  )
})

if (affiliatePages.length > 0 && !hasGeneratedPaidLinkPolicy && !everyRawPaidLinkIsMarked) {
  issues.push(
    'affiliate links need either source rel="sponsored nofollow noopener" or a postbuild affiliate-link policy',
  )
}

const renderInputs = [
  ...markdownFiles,
  ...walk(
    vuepressDir,
    (file) =>
      !file.includes(`${path.sep}dist${path.sep}`) &&
      !file.includes(`${path.sep}public${path.sep}`) &&
      !file.includes(`${path.sep}.cache${path.sep}`) &&
      !file.includes(`${path.sep}.temp${path.sep}`),
  ),
  postbuildFile,
].filter((file) => fs.existsSync(file))
const distIndex = path.join(distDir, 'index.html')
const newestRenderInput = Math.max(...renderInputs.map((file) => fs.statSync(file).mtimeMs), 0)
const distIsFresh =
  fs.existsSync(distIndex) && fs.statSync(distIndex).mtimeMs + 1 >= newestRenderInput

const htmlFileForRoute = (route) => {
  if (route === '/') return path.join(distDir, 'index.html')
  if (path.posix.extname(route)) return path.join(distDir, route.replace(/^\//, ''))
  return path.join(distDir, route.replace(/^\//, ''), 'index.html')
}

const schemaItems = (value) => {
  if (Array.isArray(value)) return value.flatMap(schemaItems)
  if (!value || typeof value !== 'object') return []
  return [value, ...(Array.isArray(value['@graph']) ? value['@graph'].flatMap(schemaItems) : [])]
}

const hasSchemaType = (value, type) => {
  const types = Array.isArray(value?.['@type']) ? value['@type'] : [value?.['@type']]
  return types.includes(type)
}

const parseRenderedSchemas = (html, label) => {
  const schemas = []

  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      schemas.push(...schemaItems(JSON.parse(match[1])))
    } catch {
      issues.push(`${label}: rendered page contains invalid JSON-LD`)
    }
  }

  return schemas
}

const renderedRouteForFile = (file) => {
  const rel = path.relative(distDir, file).replaceAll(path.sep, '/')
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return `/${rel.replace(/\/index\.html$/, '/')}`
  return `/${rel}`
}

const attributeValue = (tag, name) =>
  tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2] || ''

const metaContent = (html, attribute, value) => {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((candidate) => attributeValue(candidate, attribute).toLowerCase() === value.toLowerCase())
  return tag ? attributeValue(tag, 'content') : ''
}

const relValuesForTag = (tag) =>
  new Set(attributeValue(tag, 'rel').toLowerCase().split(/\s+/).filter(Boolean))

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

if (distIsFresh) {
  const renderedPolicyIssues = new Set()
  const renderedTitles = new Map()
  const renderedDescriptions = new Map()

  for (const htmlFile of walk(distDir, (file) => file.endsWith('.html'))) {
    const route = renderedRouteForFile(htmlFile)
    const html = fs.readFileSync(htmlFile, 'utf8')
    const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0])
    const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0])
    const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0])
    const countMetaName = (name) => metaTags.filter(
      (tag) => attributeValue(tag, 'name').toLowerCase() === name,
    ).length

    const h1Count = (html.match(/<h1\b/gi) || []).length
    if (h1Count !== 1) issues.push(`${route}: rendered page must contain exactly one H1; found ${h1Count}`)

    const charsetCount = metaTags.filter((tag) => /\bcharset\s*=/i.test(tag)).length
    if (charsetCount !== 1) issues.push(`${route}: expected one charset declaration; found ${charsetCount}`)

    const viewportCount = countMetaName('viewport')
    if (viewportCount !== 1) issues.push(`${route}: expected one viewport declaration; found ${viewportCount}`)

    const robotsCount = countMetaName('robots')
    if (robotsCount !== 1) issues.push(`${route}: expected one robots directive; found ${robotsCount}`)
    const robots = metaContent(html, 'name', 'robots')
    if (route === '/404.html' ? !/\bnoindex\b/i.test(robots) : !/\bindex\b/i.test(robots)) {
      issues.push(`${route}: robots directive does not match the page indexability`)
    }

    const canonicalTags = linkTags.filter((tag) => relValuesForTag(tag).has('canonical'))
    const canonicalCount = canonicalTags.length
    const expectedCanonicalCount = route === '/404.html' ? 0 : 1
    if (canonicalCount !== expectedCanonicalCount) {
      issues.push(`${route}: expected ${expectedCanonicalCount} canonical link(s); found ${canonicalCount}`)
    }
    if (
      route !== '/404.html'
      && canonicalCount === 1
      && attributeValue(canonicalTags[0], 'href') !== `${siteUrl}${route}`
    ) {
      issues.push(`${route}: canonical URL does not match the rendered route`)
    }

    const titleCount = (html.match(/<title\b[^>]*>/gi) || []).length
    if (titleCount !== 1) issues.push(`${route}: expected one title element; found ${titleCount}`)
    const title = html.match(/<title\b[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || ''
    const description = metaContent(html, 'name', 'description')
    if (route !== '/404.html') {
      if (!title) issues.push(`${route}: rendered title is empty`)
      if (!description) issues.push(`${route}: rendered meta description is missing`)
      if (title) {
        const owners = renderedTitles.get(title) || []
        owners.push(route)
        renderedTitles.set(title, owners)
      }
      if (description) {
        const owners = renderedDescriptions.get(description) || []
        owners.push(route)
        renderedDescriptions.set(description, owners)
      }
    }

    const prefetchCount = linkTags.filter((tag) => relValuesForTag(tag).has('prefetch')).length
    if (prefetchCount > 0) issues.push(`${route}: unnecessary page prefetch links found: ${prefetchCount}`)

    const highPriorityImages = imageTags.filter(
      (tag) => attributeValue(tag, 'fetchpriority').toLowerCase() === 'high',
    ).length
    if (highPriorityImages > 1) {
      issues.push(`${route}: more than one image has fetchpriority=high`)
    }

    for (const image of imageTags) {
      const src = attributeValue(image, 'src') || '(unknown image)'
      if (!/\balt\s*=/i.test(image)) issues.push(`${route}: rendered image lacks alt: ${src}`)
      if (!/^\d+$/.test(attributeValue(image, 'width'))) {
        issues.push(`${route}: rendered image lacks a numeric width: ${src}`)
      }
      if (!/^\d+$/.test(attributeValue(image, 'height'))) {
        issues.push(`${route}: rendered image lacks a numeric height: ${src}`)
      }
      if (!/^(?:lazy|eager)$/i.test(attributeValue(image, 'loading'))) {
        issues.push(`${route}: rendered image lacks an explicit loading strategy: ${src}`)
      }
    }

    const socialImage = metaContent(html, 'property', 'og:image')
    if (route !== '/404.html' && !socialImage) issues.push(`${route}: missing og:image`)
    if (/\.svg(?:[?#]|$)/i.test(socialImage)) {
      issues.push(`${route}: social preview image must be a raster image, not SVG`)
    }
    if (route !== '/404.html') {
      const ogDescription = metaContent(html, 'property', 'og:description')
      const twitterDescription = metaContent(html, 'name', 'twitter:description')
      if (ogDescription !== description || twitterDescription !== description) {
        issues.push(`${route}: meta, Open Graph and Twitter descriptions must match`)
      }
      if (metaContent(html, 'property', 'og:url') !== `${siteUrl}${route}`) {
        issues.push(`${route}: og:url does not match the canonical URL`)
      }
      if (metaContent(html, 'name', 'twitter:image') !== socialImage) {
        issues.push(`${route}: Twitter and Open Graph images must match`)
      }
      if (!metaContent(html, 'property', 'og:image:type')) {
        issues.push(`${route}: og:image:type is missing`)
      }
      if (!/^\d+$/.test(metaContent(html, 'property', 'og:image:width'))) {
        issues.push(`${route}: og:image:width is missing or invalid`)
      }
      if (!/^\d+$/.test(metaContent(html, 'property', 'og:image:height'))) {
        issues.push(`${route}: og:image:height is missing or invalid`)
      }
    }
    if (html.includes('ccc.jichang.best')) {
      issues.push(`${route}: rendered page contains the retired ccc.jichang.best host`)
    }
  }

  for (const [title, routes] of renderedTitles) {
    if (routes.length > 1) issues.push(`duplicate rendered title “${title}”: ${routes.join(', ')}`)
  }
  for (const [description, routes] of renderedDescriptions) {
    if (routes.length > 1) {
      issues.push(`duplicate rendered description “${description}”: ${routes.join(', ')}`)
    }
  }

  for (const route of generatedRoutes) {
    const htmlFile = htmlFileForRoute(route)
    if (!fs.existsSync(htmlFile)) {
      issues.push(`fresh build is missing generated route ${route}`)
      continue
    }
    const html = fs.readFileSync(htmlFile, 'utf8')
    if (!/<meta\s+property=["']og:type["']\s+content=["']website["']/i.test(html)) {
      issues.push(`${route}: generated aggregate page must use og:type=website`)
    }
    if (/<meta\s+property=["']article:/i.test(html)) {
      issues.push(`${route}: generated aggregate page must not contain article:* meta`)
    }
    if (!/<meta\s+property=["']og:image["']\s+content=["'][^"']+["']/i.test(html)) {
      issues.push(`${route}: generated aggregate page is missing og:image`)
    }

    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (heading !== generatedRouteHeadings.get(route)) {
      issues.push(`${route}: expected visible H1 “${generatedRouteHeadings.get(route)}”, found “${heading || ''}”`)
    }

    const collection = parseRenderedSchemas(html, route)
      .find((schema) => hasSchemaType(schema, 'CollectionPage'))
    if (!collection) {
      issues.push(`${route}: generated aggregate page is missing CollectionPage JSON-LD`)
    } else {
      if (normalizeHref(collection.url) !== `${siteUrl}${route}`) {
        issues.push(`${route}: CollectionPage URL disagrees with its canonical route`)
      }
      if (!hasSchemaType(collection.breadcrumb, 'BreadcrumbList')) {
        issues.push(`${route}: CollectionPage JSON-LD is missing breadcrumbs`)
      }
      if (
        ['/blog/', '/blog/archives/'].includes(route)
        && !hasSchemaType(collection.mainEntity, 'ItemList')
      ) {
        issues.push(`${route}: article collection is missing an ItemList`)
      }
    }

    if (route === '/blog/categories/') {
      for (const category of expectedCategoryNames) {
        if (!html.includes(category)) issues.push(`${route}: missing category ${category}`)
      }
    }
  }

  for (const page of pages) {
    if (!page.route) continue
    const htmlFile = htmlFileForRoute(page.route)
    if (!fs.existsSync(htmlFile)) {
      issues.push(`${page.rel}: fresh build is missing rendered route ${page.route}`)
      continue
    }

    const html = fs.readFileSync(htmlFile, 'utf8')
    const anchors = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>/gi)]

    for (const anchor of anchors) {
      const href = normalizeHref(anchor[2])
      if (!/^https?:\/\//i.test(href)) continue

      let url
      try {
        url = new URL(href)
      } catch {
        continue
      }
      if (siteHostPattern.test(url.hostname)) continue

      const relValues = new Set(
        (anchor[0].match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2] || '')
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean),
      )

      if (isAffiliateUrl(href)) {
        const missing = ['sponsored', 'nofollow', 'noopener'].filter(
          (value) => !relValues.has(value),
        )
        if (missing.length > 0) {
          renderedPolicyIssues.add(
            `${page.rel}: affiliate link is missing rel=${missing.join('+')}: ${href}`,
          )
        }
      } else {
        if (relValues.has('sponsored')) {
          renderedPolicyIssues.add(
            `${page.rel}: ordinary external link must not be sponsored: ${href}`,
          )
        }
        if (relValues.has('nofollow')) {
          renderedPolicyIssues.add(
            `${page.rel}: ordinary editorial link must not be nofollow: ${href}`,
          )
        }
        if (!relValues.has('noopener')) {
          renderedPolicyIssues.add(
            `${page.rel}: ordinary external link needs noopener: ${href}`,
          )
        }
      }
    }

    if (!page.isArticle) continue

    const schemas = parseRenderedSchemas(html, page.rel)

    const article = schemas.find((schema) => hasSchemaType(schema, 'Article'))
    if (!article) {
      issues.push(`${page.rel}: rendered page is missing Article JSON-LD`)
      continue
    }

    const authors = Array.isArray(article.author) ? article.author : [article.author]
    const author = authors.find(
      (candidate) =>
        hasSchemaType(candidate, 'Organization') &&
        candidate?.name === 'Sell VPN' &&
        normalizeHref(candidate?.url) === `${siteUrl}/about/`,
    )
    if (!author) {
      issues.push(`${page.rel}: Article author must be Organization Sell VPN at ${siteUrl}/about/`)
    }

    const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || ''
    const mainText = mainHtml
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
    if (!/作者[：:]\s*Sell VPN/.test(mainText)) {
      issues.push(`${page.rel}: visible article byline must read “作者：Sell VPN”`)
    }
    if (!/最近核对[：:]\s*\d{4}-\d{2}-\d{2}/.test(mainText)) {
      issues.push(`${page.rel}: visible article byline must include a recent-check date`)
    }
    if (!/<a\b[^>]*href=["']\/blog\/tags\/\?tag=/i.test(html)) {
      issues.push(`${page.rel}: rendered article tags must link to the tag collection`)
    }

    const breadcrumb = schemas.find((schema) => hasSchemaType(schema, 'BreadcrumbList'))
    const breadcrumbItems = Array.isArray(breadcrumb?.itemListElement)
      ? breadcrumb.itemListElement
      : []
    if (!breadcrumbItems.some((item) => normalizeHref(item?.item) === `${siteUrl}/blog/`)) {
      issues.push(`${page.rel}: article breadcrumb must include the all-articles page`)
    }

    const published = parseSeoDate(article.datePublished)
    const modified = parseSeoDate(article.dateModified)
    const expectedPublished = parseSeoDate(page.data.createTime || page.data.date)
    const expectedModified = parseSeoDate(page.data.updateTime)
    if (!published) issues.push(`${page.rel}: Article datePublished is missing or invalid`)
    if (!modified) issues.push(`${page.rel}: Article dateModified is missing or invalid`)
    if (published && expectedPublished && published.getTime() !== expectedPublished.getTime()) {
      issues.push(`${page.rel}: Article datePublished disagrees with createTime/date`)
    }
    if (published && modified && modified < published) {
      issues.push(`${page.rel}: Article dateModified is earlier than datePublished`)
    }
    if (modified && expectedModified && modified.getTime() !== expectedModified.getTime()) {
      issues.push(`${page.rel}: Article dateModified disagrees with updateTime`)
    }
  }

  issues.push(...renderedPolicyIssues)

  const sitemapFile = path.join(distDir, 'sitemap.xml')
  if (!fs.existsSync(sitemapFile)) {
    issues.push('fresh build is missing sitemap.xml')
  } else {
    const sitemap = fs.readFileSync(sitemapFile, 'utf8')
    for (const route of routePaths) {
      const canonical = `${siteUrl}${route}`
      if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
        issues.push(`sitemap.xml is missing ${canonical}`)
      }
    }
    for (const route of generatedRoutes) {
      const canonical = `${siteUrl}${route}`
      const match = sitemap.match(
        new RegExp(`<url>\\s*<loc>${escapeRegExp(canonical)}<\\/loc>([\\s\\S]*?)<\\/url>`),
      )
      if (!match || !/<lastmod>[^<]+<\/lastmod>/.test(match[1])) {
        issues.push(`sitemap.xml aggregate route lacks lastmod: ${canonical}`)
      }
    }
  }

  const llmsFile = path.join(distDir, 'llms.txt')
  if (!fs.existsSync(llmsFile)) {
    issues.push('fresh build is missing llms.txt')
  } else {
    const llms = fs.readFileSync(llmsFile, 'utf8')
    if (/\/index\.html(?:[\s)#]|$)/.test(llms)) {
      issues.push('llms.txt contains non-canonical /index.html URLs')
    }
    const llmsUrls = new Set(
      [...llms.matchAll(/\]\((https:\/\/sellvpn\.net[^)\s]+)\)/g)].map((match) => match[1]),
    )
    for (const page of pages) {
      if (page.route && !llmsUrls.has(`${siteUrl}${page.route}`)) {
        issues.push(`llms.txt is missing ${siteUrl}${page.route}`)
      }
    }
  }
} else if (fs.existsSync(distIndex)) {
  warnings.push('rendered HTML is older than its SEO inputs; generated-output checks were skipped')
} else {
  warnings.push('rendered HTML is absent; generated-output checks were skipped')
}

for (const warning of [...new Set(warnings)].sort()) console.warn(`Warning: ${warning}`)

if (issues.length > 0) {
  console.error('SEO audit failed:')
  for (const issue of [...new Set(issues)].sort()) console.error(`- ${issue}`)
  process.exit(1)
}

console.log(
  `SEO audit passed: ${pages.length} pages, ${routeOwners.size} unique routes, ` +
    `${focusTopicRoutes.size} focus topics, ${affiliatePages.length} affiliate pages and ` +
    `${publicAssets.size} public assets checked` +
    `${distIsFresh ? '; generated HTML verified.' : '; source checks only.'}`,
)
