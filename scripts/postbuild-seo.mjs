import fs from 'node:fs'
import path from 'node:path'

const distDir = path.join(process.cwd(), 'docs', '.vuepress', 'dist')
const siteHostPattern = /^https?:\/\/(?:www\.)?sellvpn\.net/i

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

let updatedHtmlFiles = 0
let updatedLinks = 0

for (const file of walk(distDir, (item) => item.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8')
  const next = html.replace(/<a\b[^>]*\bhref="https?:\/\/[^"]+"[^>]*>/gi, (tag) => {
    const updated = addNofollow(tag)
    if (updated !== tag) updatedLinks += 1
    return updated
  })

  if (next !== html) {
    fs.writeFileSync(file, next)
    updatedHtmlFiles += 1
  }
}

fs.writeFileSync(
  path.join(distDir, 'robots.txt'),
  ['User-agent: *', 'Allow: /', 'Sitemap: https://sellvpn.net/sitemap.xml', ''].join('\n'),
)

console.log(`Postbuild SEO: updated ${updatedLinks} external links in ${updatedHtmlFiles} HTML files and normalized robots.txt.`)
