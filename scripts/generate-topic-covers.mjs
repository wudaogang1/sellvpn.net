import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const publicDir = path.join(process.cwd(), 'docs', '.vuepress', 'public')
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sellvpn-covers-'))

const covers = [
  {
    file: 'cover-airport-ranking-2026.jpg',
    title: '2026机场推荐',
    subtitle: '稳定机场排行 / 优惠码 / 测评入口',
    colors: ['#2563eb', '#0f766e', '#f59e0b'],
  },
  {
    file: 'cover-airport-coupon-2026.jpg',
    title: '各大机场优惠码',
    subtitle: '折扣码 / 套餐价格 / 购买前确认',
    colors: ['#0f766e', '#2563eb', '#f97316'],
  },
  {
    file: 'cover-airport-links-2026.jpg',
    title: '机场入口汇总',
    subtitle: '注册链接 / 优惠码 / 测评文章',
    colors: ['#334155', '#2563eb', '#14b8a6'],
  },
  {
    file: 'cover-airport-test-2026.jpg',
    title: '机场测速体验',
    subtitle: '晚高峰 / 节点速度 / 真实使用',
    colors: ['#4338ca', '#0891b2', '#22c55e'],
  },
  {
    file: 'cover-cheap-airport-2026.jpg',
    title: '便宜机场推荐',
    subtitle: '低价套餐 / 备用机场 / 短周期测试',
    colors: ['#0f766e', '#ca8a04', '#2563eb'],
  },
  {
    file: 'cover-chatgpt-airport-2026.jpg',
    title: 'ChatGPT机场推荐',
    subtitle: 'AI工具节点 / Claude / Gemini',
    colors: ['#2563eb', '#7c3aed', '#0f766e'],
  },
  {
    file: 'cover-streaming-airport-2026.jpg',
    title: '流媒体机场推荐',
    subtitle: 'Netflix / YouTube / TikTok 解锁',
    colors: ['#be123c', '#2563eb', '#f59e0b'],
  },
  {
    file: 'cover-airport-speed-test-2026.jpg',
    title: '机场测速方法',
    subtitle: '延迟 / 丢包 / YouTube / 晚高峰',
    colors: ['#2563eb', '#0ea5e9', '#22c55e'],
  },
  {
    file: 'cover-airport-risk-2026.jpg',
    title: '机场避坑指南',
    subtitle: '防跑路 / 年付风险 / 购买清单',
    colors: ['#b45309', '#dc2626', '#2563eb'],
  },
  {
    file: 'cover-clash-verge.jpg',
    title: 'Clash Verge教程',
    subtitle: 'Windows / macOS / 订阅导入',
    colors: ['#2563eb', '#64748b', '#0f766e'],
  },
  {
    file: 'cover-shadowrocket.jpg',
    title: 'Shadowrocket教程',
    subtitle: 'iPhone小火箭 / 节点选择 / 常见问题',
    colors: ['#0f766e', '#2563eb', '#7c3aed'],
  },
  {
    file: 'cover-science-internet-2026.jpg',
    title: '科学上网新手指南',
    subtitle: 'VPN / 机场 / 订阅链接 / 代理客户端',
    colors: ['#2563eb', '#0f766e', '#94a3b8'],
  },
  {
    file: 'cover-vpn-vs-airport-2026.jpg',
    title: 'VPN和机场区别',
    subtitle: '传统VPN / 机场订阅 / 新手选择',
    colors: ['#2563eb', '#334155', '#0f766e'],
  },
  {
    file: 'cover-choose-airport-2026.jpg',
    title: '如何挑选机场',
    subtitle: '稳定性 / 流量 / 倍率 / 售后',
    colors: ['#0f766e', '#334155', '#f59e0b'],
  },
  {
    file: 'cover-us-apple-id-2026.jpg',
    title: '美区Apple ID教程',
    subtitle: '无需信用卡 / App Store / iOS新手',
    colors: ['#334155', '#2563eb', '#0f766e'],
  },
  {
    file: 'cover-review-sujie-2026.jpg',
    title: '速界机场测评',
    subtitle: '官网入口 / 优惠码 / 节点体验',
    colors: ['#2563eb', '#0f766e', '#f59e0b'],
  },
  {
    file: 'cover-review-edgenova-2026.jpg',
    title: 'EdgenNova测评',
    subtitle: '套餐价格 / 优惠码 / 购买建议',
    colors: ['#1d4ed8', '#0f766e', '#7c3aed'],
  },
  {
    file: 'cover-review-kuaili-2026.jpg',
    title: '快狸机场测评',
    subtitle: '8折优惠 / 备用机场 / 短周期测试',
    colors: ['#0f766e', '#ca8a04', '#2563eb'],
  },
  {
    file: 'cover-review-soso-2026.jpg',
    title: 'Soso云测评',
    subtitle: '官网入口 / 节点体验 / 新手建议',
    colors: ['#2563eb', '#0891b2', '#f59e0b'],
  },
  {
    file: 'cover-review-guangsuyun-2026.jpg',
    title: '光速云测评',
    subtitle: 'AMM优惠码 / 新人8折 / 节点体验',
    colors: ['#0284c7', '#2563eb', '#22c55e'],
  },
  {
    file: 'cover-review-shunyun-2026.jpg',
    title: '瞬云机场测评',
    subtitle: '20off优惠码 / 价格表 / 稳定性',
    colors: ['#4338ca', '#0891b2', '#f97316'],
  },
  {
    file: 'cover-review-wangjikuai-2026.jpg',
    title: '网际快车测评',
    subtitle: '官网入口 / 大流量 / 购买建议',
    colors: ['#334155', '#2563eb', '#14b8a6'],
  },
  {
    file: 'cover-review-quanqiuyun-2026.jpg',
    title: '全球云测评',
    subtitle: '永久8折 / 专线节点 / 流媒体',
    colors: ['#0f766e', '#2563eb', '#f59e0b'],
  },
  {
    file: 'cover-review-xxyun-2026.jpg',
    title: 'XXYUN测评',
    subtitle: '新人9折 / 低价套餐 / 节点测速',
    colors: ['#7c3aed', '#2563eb', '#0f766e'],
  },
  {
    file: 'cover-review-99ba-2026.jpg',
    title: '99吧机场测评',
    subtitle: '9.9元套餐 / 真实测速 / 优缺点',
    colors: ['#b45309', '#2563eb', '#0f766e'],
  },
  {
    file: 'cover-review-chongshangyunxiao-2026.jpg',
    title: '冲上云霄测评',
    subtitle: '台湾家宽 / BGP专线 / 套餐价格',
    colors: ['#be123c', '#2563eb', '#f59e0b'],
  },
  {
    file: 'cover-review-ssone-2026.jpg',
    title: 'SSONE测评',
    subtitle: '10元套餐 / 节点测速 / 稳定性',
    colors: ['#2563eb', '#64748b', '#0f766e'],
  },
  {
    file: 'cover-review-weituyun-2026.jpg',
    title: '唯兔云测评',
    subtitle: 'IPLC专线 / 价格套餐 / 使用体验',
    colors: ['#0f766e', '#2563eb', '#7c3aed'],
  },
  {
    file: 'cover-review-u1s1-2026.jpg',
    title: 'u1s1机场测评',
    subtitle: '永久8折 / 官网入口 / 节点体验',
    colors: ['#2563eb', '#0f766e', '#94a3b8'],
  },
  {
    file: 'cover-review-cocoduck-2026.jpg',
    title: 'cocoduck测评',
    subtitle: '官网入口 / 备用机场 / 购买建议',
    colors: ['#0f766e', '#334155', '#f59e0b'],
  },
  {
    file: 'cover-review-flybit-2026.jpg',
    title: 'Flybit机场测评',
    subtitle: 'IPLC专线 / 节点测速 / 流媒体',
    colors: ['#2563eb', '#0f766e', '#f97316'],
  },
  {
    file: 'cover-review-guangnianti-2026.jpg',
    title: '光年梯测评',
    subtitle: '套餐价格 / 晚高峰 / 节点测速',
    colors: ['#334155', '#0f766e', '#f59e0b'],
  },
]

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const getTitleSize = (title) => {
  if (title.length >= 14) return 52
  if (title.length >= 11) return 58
  return 66
}

const getSubtitleSize = (subtitle) => {
  if (subtitle.length >= 28) return 24
  if (subtitle.length >= 22) return 26
  return 28
}

const buildPills = (parts, colors) => {
  const [primary, secondary, accent] = colors
  const palette = [primary, secondary, accent]

  return parts
    .slice(0, 3)
    .map((part, index) => {
      const x = index * 176
      const width = part.length > 6 ? 150 : 132
      const color = palette[index]

      return `
    <rect x="${x}" y="448" width="${width}" height="42" rx="21" fill="${color}" opacity="0.1"/>
    <text x="${x + 22}" y="475" fill="${color}" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(part)}</text>`
    })
    .join('')
}

const buildSvg = ({ title, subtitle, colors }) => {
  const [primary, secondary, accent] = colors
  const titleSize = getTitleSize(title)
  const subtitleSize = getSubtitleSize(subtitle)
  const parts = subtitle.split('/').map((part) => part.trim()).filter(Boolean)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="softBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="45%" stop-color="#eef7ff"/>
      <stop offset="100%" stop-color="#ecfdf5"/>
    </linearGradient>
    <linearGradient id="brandBand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="55%" stop-color="${secondary}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#0f172a" stroke-width="1" opacity="0.06"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="1200" height="675" fill="url(#softBg)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>
  <path d="M0 0 H1200 V150 C1010 94 894 150 720 106 C506 52 330 124 0 58 Z" fill="url(#brandBand)" opacity="0.18"/>
  <path d="M0 675 H1200 V522 C1032 610 892 566 734 594 C502 636 280 570 0 632 Z" fill="url(#brandBand)" opacity="0.12"/>

  <g transform="translate(62 58)">
    <rect x="0" y="0" width="1076" height="558" rx="30" fill="#ffffff" opacity="0.82" filter="url(#shadow)"/>
    <rect x="18" y="18" width="1040" height="522" rx="24" fill="#ffffff" opacity="0.88"/>
    <rect x="18" y="18" width="1040" height="6" rx="3" fill="url(#brandBand)"/>
  </g>

  <g transform="translate(108 108)">
    <rect x="0" y="0" width="168" height="36" rx="18" fill="${primary}" opacity="0.1"/>
    <text x="20" y="24" fill="${primary}" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="16" font-weight="800">SELLVPN.NET</text>
    <rect x="188" y="0" width="104" height="36" rx="18" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="212" y="24" fill="#475569" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="16" font-weight="700">2026</text>

    <text x="0" y="154" fill="#0f172a" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="${titleSize}" font-weight="900">${escapeXml(title)}</text>
    <rect x="0" y="184" width="74" height="8" rx="4" fill="${accent}"/>
    <text x="0" y="244" fill="#475569" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="${subtitleSize}" font-weight="600">${escapeXml(subtitle)}</text>
    <text x="0" y="298" fill="#64748b" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="19" font-weight="500">入口、优惠、套餐、节点体验一页看清</text>
${buildPills(parts, colors)}
  </g>

  <g transform="translate(732 126)" filter="url(#softShadow)">
    <rect x="0" y="0" width="338" height="316" rx="24" fill="#0f172a"/>
    <rect x="0" y="0" width="338" height="54" rx="24" fill="#111827"/>
    <circle cx="32" cy="27" r="7" fill="#ef4444"/>
    <circle cx="56" cy="27" r="7" fill="#f59e0b"/>
    <circle cx="80" cy="27" r="7" fill="#22c55e"/>
    <rect x="112" y="18" width="178" height="18" rx="9" fill="#334155"/>

    <g transform="translate(28 82)">
      <text x="0" y="0" fill="#e2e8f0" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="18" font-weight="800">节点体验面板</text>
      <path d="M4 120 C52 60 98 130 148 70 C190 20 232 84 282 34" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="4" cy="120" r="8" fill="${accent}"/>
      <circle cx="148" cy="70" r="8" fill="${accent}"/>
      <circle cx="282" cy="34" r="8" fill="${accent}"/>
      <rect x="0" y="166" width="78" height="44" rx="14" fill="${primary}" opacity="0.9"/>
      <text x="24" y="194" fill="#ffffff" font-family="Arial, sans-serif" font-size="17" font-weight="800">HK</text>
      <rect x="102" y="166" width="78" height="44" rx="14" fill="${secondary}" opacity="0.9"/>
      <text x="128" y="194" fill="#ffffff" font-family="Arial, sans-serif" font-size="17" font-weight="800">JP</text>
      <rect x="204" y="166" width="78" height="44" rx="14" fill="${accent}" opacity="0.9"/>
      <text x="230" y="194" fill="#ffffff" font-family="Arial, sans-serif" font-size="17" font-weight="800">US</text>
    </g>
  </g>

  <g transform="translate(780 466)" filter="url(#softShadow)">
    <rect x="0" y="0" width="290" height="112" rx="22" fill="#ffffff"/>
    <text x="24" y="34" fill="#0f172a" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="17" font-weight="800">测评关注点</text>
    <circle cx="30" cy="62" r="6" fill="${primary}"/>
    <text x="48" y="67" fill="#475569" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="15" font-weight="700">速度测试</text>
    <circle cx="142" cy="62" r="6" fill="${secondary}"/>
    <text x="160" y="67" fill="#475569" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="15" font-weight="700">晚高峰</text>
    <circle cx="30" cy="90" r="6" fill="${accent}"/>
    <text x="48" y="95" fill="#475569" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="15" font-weight="700">套餐优惠</text>
    <circle cx="142" cy="90" r="6" fill="#64748b"/>
    <text x="160" y="95" fill="#475569" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="15" font-weight="700">订阅导入</text>
  </g>

  <g transform="translate(632 466)" filter="url(#softShadow)">
    <rect x="0" y="0" width="116" height="112" rx="22" fill="${primary}"/>
    <text x="22" y="44" fill="#ffffff" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="18" font-weight="800">先月付</text>
    <text x="22" y="78" fill="#ffffff" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="18" font-weight="800">再续费</text>
  </g>

  <g transform="translate(966 420)">
    <rect x="0" y="0" width="112" height="46" rx="18" fill="${accent}" opacity="0.96"/>
    <text x="22" y="29" fill="#ffffff" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" font-size="18" font-weight="800">指南</text>
  </g>
</svg>`
}

fs.mkdirSync(publicDir, { recursive: true })

for (const cover of covers) {
  const svgPath = path.join(tempDir, cover.file.replace(/\.jpe?g$/, '.svg'))
  const jpgPath = path.join(publicDir, cover.file)

  fs.writeFileSync(svgPath, buildSvg(cover))
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', svgPath, '--out', jpgPath], { stdio: 'ignore' })
}

console.log(`Generated ${covers.length} cover images in ${publicDir}`)
fs.rmSync(tempDir, { recursive: true, force: true })
