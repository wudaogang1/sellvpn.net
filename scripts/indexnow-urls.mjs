import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const siteUrl = 'https://sellvpn.net'
const aggregateRoutes = ['/blog/', '/blog/tags/', '/blog/categories/', '/blog/archives/']
const args = process.argv.slice(2)

const option = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? '' : args[index + 1] || ''
}

const full = args.includes('--full')
const base = option('--base')
const head = option('--head')
const sitemapFile = option('--sitemap')

if (!sitemapFile || (!full && (!base || !head))) {
  console.error(
    'Usage: node scripts/indexnow-urls.mjs --sitemap <file> (--full | --base <sha> --head <sha>)',
  )
  process.exit(2)
}

const sitemap = fs.readFileSync(sitemapFile, 'utf8')
const currentUrls = new Set(
  [...sitemap.matchAll(/<loc>\s*(https:\/\/sellvpn\.net(?:\/[^<]*)?)\s*<\/loc>/gi)].map(
    (match) => match[1].trim(),
  ),
)

if (currentUrls.size === 0) {
  throw new Error(`No sellvpn.net URLs found in sitemap: ${sitemapFile}`)
}

if (full) {
  process.stdout.write(`${[...currentUrls].sort().join('\n')}\n`)
  process.exit(0)
}

const git = (...gitArgs) =>
  execFileSync('git', gitArgs, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

for (const ref of [base, head]) git('cat-file', '-e', `${ref}^{commit}`)

const changedOutput = execFileSync(
  'git',
  ['diff', '--name-status', '--no-renames', '--diff-filter=ADM', '-z', base, head],
  { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 },
)

const fields = changedOutput.toString('utf8').split('\0').filter(Boolean)
const changes = []

for (let index = 0; index < fields.length; index += 2) {
  const status = fields[index]
  const file = fields[index + 1]
  if (!status || !file) throw new Error('Unexpected git diff --name-status output')
  changes.push({ status, file })
}

const readAt = (ref, file) => {
  try {
    return git('show', `${ref}:${file}`)
  } catch {
    return ''
  }
}

const routeFromMarkdown = (file, content) => {
  if (!content) return ''
  if (file === 'docs/index.md') return '/'

  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || ''
  const permalink = frontmatter.match(/^permalink:\s*['"]?([^'"\s]+)['"]?\s*$/m)?.[1]
  if (!permalink || !permalink.startsWith('/')) return ''
  return permalink.endsWith('/') || /\.[a-z0-9]+$/i.test(permalink)
    ? permalink
    : `${permalink}/`
}

const urlFromRoute = (route) => (route ? new URL(route, siteUrl).href : '')
const urls = new Set()
let markdownChanged = false
let globalRenderingChanged = false
const changedPublicAssets = []

for (const { status, file } of changes) {
  if (file.endsWith('.md') && file.startsWith('docs/') && !file.includes('/.vuepress/')) {
    markdownChanged = true

    if (status !== 'A') {
      const oldUrl = urlFromRoute(routeFromMarkdown(file, readAt(base, file)))
      if (oldUrl) urls.add(oldUrl)
    }

    if (status !== 'D') {
      const newUrl = urlFromRoute(routeFromMarkdown(file, readAt(head, file)))
      if (newUrl) urls.add(newUrl)
    }
    continue
  }

  if (file.startsWith('docs/.vuepress/public/')) {
    changedPublicAssets.push(`/${file.slice('docs/.vuepress/public/'.length)}`)
    continue
  }

  if (
    (file.startsWith('docs/.vuepress/') && !file.startsWith('docs/.vuepress/public/')) ||
    file === 'scripts/postbuild-seo.mjs' ||
    file === 'package.json' ||
    file === 'pnpm-lock.yaml'
  ) {
    globalRenderingChanged = true
  }
}

if (globalRenderingChanged) {
  for (const url of currentUrls) urls.add(url)
} else {
  if (markdownChanged) {
    for (const route of aggregateRoutes) {
      const url = urlFromRoute(route)
      if (currentUrls.has(url)) urls.add(url)
    }
  }

  if (changedPublicAssets.length > 0) {
    const markdownAtHead = git('ls-tree', '-r', '--name-only', head, '--', 'docs')
      .split('\n')
      .filter(
        (file) => file.endsWith('.md') && !file.includes('/.vuepress/') && file.length > 0,
      )

    for (const file of markdownAtHead) {
      const content = readAt(head, file)
      if (!changedPublicAssets.some((asset) => content.includes(asset))) continue
      const url = urlFromRoute(routeFromMarkdown(file, content))
      if (url) urls.add(url)
    }
  }
}

const safeUrls = [...urls].filter((url) => {
  const parsed = new URL(url)
  return parsed.protocol === 'https:' && parsed.hostname === 'sellvpn.net'
})

if (safeUrls.length > 10_000) {
  throw new Error(`IndexNow accepts at most 10,000 URLs per request; got ${safeUrls.length}`)
}

if (safeUrls.length > 0) process.stdout.write(`${safeUrls.sort().join('\n')}\n`)
