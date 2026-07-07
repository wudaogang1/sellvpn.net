import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const publicDir = path.join(docsDir, '.vuepress', 'public')

const issues = []
const warnings = []

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

const markdownFiles = walk(
  docsDir,
  (file) => file.endsWith('.md') && !file.includes(`${path.sep}.vuepress${path.sep}`),
)

const publicFiles = fs.existsSync(publicDir)
  ? walk(publicDir).map((file) => `/${path.relative(publicDir, file).replaceAll(path.sep, '/')}`)
  : []

const publicAssets = new Set(publicFiles)

const parseFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  const raw = match?.[1] ?? ''
  const data = {}

  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (match) data[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }

  return { data, raw }
}

const normalizeRoute = (route) => {
  if (!route || route === '/') return '/'

  const clean = route
    .replace(/^https?:\/\/(?:www\.)?sellvpn\.net/i, '')
    .split(/[?#]/)[0]

  if (path.extname(clean)) return clean
  return clean.endsWith('/') ? clean : `${clean}/`
}

const routePaths = new Set()
const pages = markdownFiles.map((file) => {
  const content = fs.readFileSync(file, 'utf8')
  const { data } = parseFrontmatter(content)
  const rel = path.relative(root, file)
  const isHome = data.home === 'true'
  const route = isHome ? '/' : normalizeRoute(data.permalink)

  if (route) routePaths.add(route)

  return { file, rel, content, data, isHome, route }
})

for (const page of pages) {
  const { data, rel, content, isHome } = page
  const h1Count = (content.match(/^# /gm) ?? []).length

  if (!data.title) issues.push(`${rel}: missing title`)
  if (!data.description) issues.push(`${rel}: missing description`)
  if (!isHome && !data.date) issues.push(`${rel}: missing date`)
  if (!isHome && !data.permalink) issues.push(`${rel}: missing permalink`)
  if (h1Count > 0) issues.push(`${rel}: markdown body has ${h1Count} H1 heading(s); use H2+ under the page title`)

  if (data.title && [...data.title].length > 80) {
    warnings.push(`${rel}: title is longer than 80 characters`)
  }

  if (data.description) {
    const length = [...data.description].length
    if (length < 50) warnings.push(`${rel}: description is shorter than 50 characters`)
    if (length > 180) warnings.push(`${rel}: description is longer than 180 characters`)
  }

  if (data.cover?.startsWith('/') && !publicAssets.has(data.cover)) {
    issues.push(`${rel}: cover asset not found: ${data.cover}`)
  }

  const links = [...content.matchAll(/\[[^\]]*?\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((match) => match[1])

  for (const link of links) {
    if (
      link.startsWith('#') ||
      link.startsWith('mailto:') ||
      link.startsWith('tel:') ||
      (/^https?:\/\//i.test(link) && !/^https?:\/\/(?:www\.)?sellvpn\.net/i.test(link))
    ) {
      continue
    }

    const clean = link.replace(/^https?:\/\/(?:www\.)?sellvpn\.net/i, '').split(/[?#]/)[0]

    if (!clean.startsWith('/')) continue

    if (path.extname(clean)) {
      if (!publicAssets.has(clean)) issues.push(`${rel}: linked asset not found: ${link}`)
      continue
    }

    const route = normalizeRoute(clean)
    if (!routePaths.has(route)) issues.push(`${rel}: internal link target not found: ${link}`)
  }
}

if (!publicAssets.has('/robots.txt')) {
  issues.push('docs/.vuepress/public/robots.txt is missing')
}

if (publicAssets.has('/robot.txt')) {
  issues.push('docs/.vuepress/public/robot.txt should be renamed to robots.txt')
}

for (const warning of warnings) console.warn(`Warning: ${warning}`)

if (issues.length > 0) {
  console.error('SEO audit failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log(`SEO audit passed: ${pages.length} pages, ${routePaths.size} routes, ${publicAssets.size} public assets checked.`)
