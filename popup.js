const moods = {
  thriving: { text: 'thriving & purring!', bubble: '*' },
  happy:    { text: 'happy & fed',         bubble: '+' },
  neutral:  { text: 'feeling okay...',     bubble: '.' },
  sad:      { text: 'getting hungry...',   bubble: '..' },
  starving: { text: 'STARVING!! work now!!', bubble: '!!' },
}

let prevcount = null
let version = 'popup-v1'
let _tmp = null

const ui = {
  wrap:        document.getElementById('catSvgWrap'),
  bubble:      document.getElementById('moodBubble'),
  status:      document.getElementById('statusText'),
  mochi:       document.getElementById('mochiCount'),
  hbar:        document.getElementById('hungerFill'),
  productive:  document.getElementById('statProductive'),
  neutral:     document.getElementById('statNeutral'),
  distraction: document.getElementById('statDistraction'),
  dot:         document.getElementById('siteDot'),
  sitename:    document.getElementById('siteName'),
  sitemochi:   document.getElementById('siteMochi'),
  particles:   document.getElementById('particles'),
  infopanel:   document.getElementById('infoPanel'),
}

function catsvg(mood) {
  const faces = {
    thriving: {
      body: '#ffb3d1', belly: '#ffe0ee', earinner: '#ff85b3',
      eyes: `
        <path d="M 36 52 Q 41 47 46 52" stroke="#3d2a35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 54 52 Q 59 47 64 52" stroke="#3d2a35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      `,
      cheeks: `<ellipse cx="34" cy="58" rx="7" ry="5" fill="#ff85b3" opacity="0.5"/>
               <ellipse cx="66" cy="58" rx="7" ry="5" fill="#ff85b3" opacity="0.5"/>`,
      mouth: `<path d="M 44 63 Q 50 68 56 63" stroke="#3d2a35" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      extras: '',
      tailspeed: 'tailWag 0.5s ease-in-out infinite',
    },
    happy: {
      body: '#ffc4dc', belly: '#ffe8f2', earinner: '#ff9abf',
      eyes: `
        <path d="M 36 53 Q 41 48 46 53" stroke="#3d2a35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 54 53 Q 59 48 64 53" stroke="#3d2a35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      `,
      cheeks: `<ellipse cx="34" cy="58" rx="6" ry="4" fill="#ff9abf" opacity="0.4"/>
               <ellipse cx="66" cy="58" rx="6" ry="4" fill="#ff9abf" opacity="0.4"/>`,
      mouth: `<path d="M 45 63 Q 50 67 55 63" stroke="#3d2a35" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      extras: '',
      tailspeed: 'tailWag 1s ease-in-out infinite',
    },
    neutral: {
      body: '#ffd6e7', belly: '#fff0f6', earinner: '#ffb3d1',
      eyes: `
        <ellipse cx="41" cy="52" rx="5" ry="5" fill="#3d2a35"/>
        <ellipse cx="59" cy="52" rx="5" ry="5" fill="#3d2a35"/>
        <ellipse cx="43" cy="50" rx="1.5" ry="1.5" fill="white"/>
        <ellipse cx="61" cy="50" rx="1.5" ry="1.5" fill="white"/>
      `,
      cheeks: `<ellipse cx="34" cy="59" rx="5" ry="4" fill="#ffb3d1" opacity="0.25"/>
               <ellipse cx="66" cy="59" rx="5" ry="4" fill="#ffb3d1" opacity="0.25"/>`,
      mouth: `<line x1="45" y1="65" x2="55" y2="65" stroke="#3d2a35" stroke-width="2" stroke-linecap="round"/>`,
      extras: '',
      tailspeed: 'tailWag 2s ease-in-out infinite',
    },
    sad: {
      body: '#e8c0d0', belly: '#f5e0ea', earinner: '#d4a0b8',
      eyes: `
        <path d="M 36 54 Q 41 59 46 54" stroke="#3d2a35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 54 54 Q 59 59 64 54" stroke="#3d2a35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="36" cy="59" rx="2" ry="3" fill="#a8d8ea" opacity="0.7"/>
      `,
      cheeks: '',
      mouth: `<path d="M 44 67 Q 50 63 56 67" stroke="#3d2a35" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      extras: '',
      tailspeed: 'tailWag 3s ease-in-out infinite',
    },
    starving: {
      body: '#d4a8be', belly: '#ead0de', earinner: '#c090a8',
      eyes: `
        <text x="31" y="58" font-size="14" fill="#3d2a35" font-weight="bold">✕</text>
        <text x="53" y="58" font-size="14" fill="#3d2a35" font-weight="bold">✕</text>
      `,
      cheeks: '',
      mouth: `<path d="M 42 68 Q 50 62 58 68" stroke="#3d2a35" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      extras: '',
      tailspeed: 'tailWag 4s ease-in-out infinite',
    },
  }

  const c = faces[mood] || faces.happy
  return `
  <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .tail     { transform-origin: 85px 90px; animation: ${c.tailspeed}; }
        .ear-left { transform-origin: 28px 30px; animation: earTwitch 4s ease-in-out infinite; }
        @keyframes tailWag {
          0%,100% { transform: rotate(-15deg); }
          50%     { transform: rotate(15deg); }
        }
        @keyframes earTwitch {
          0%,85%,100% { transform: rotate(0deg); }
          88%         { transform: rotate(-12deg); }
          92%         { transform: rotate(5deg); }
        }
      </style>
    </defs>
    <path class="tail" d="M 72 95 Q 90 80 88 100 Q 86 115 75 108"
      fill="${c.body}" stroke="#c0809a" stroke-width="1.5"/>
    <ellipse cx="50" cy="95" rx="30" ry="22" fill="${c.body}"/>
    <ellipse cx="50" cy="98" rx="18" ry="14" fill="${c.belly}" opacity="0.8"/>
    <circle cx="50" cy="50" r="28" fill="${c.body}"/>
    <polygon class="ear-left" points="22,28 28,8 42,28"  fill="${c.body}"/>
    <polygon class="ear-left" points="26,27 30,14 39,27" fill="${c.earinner}" opacity="0.7"/>
    <polygon points="58,28 72,8 78,28"  fill="${c.body}"/>
    <polygon points="61,27 70,14 75,27" fill="${c.earinner}" opacity="0.7"/>
    <line x1="10" y1="60" x2="34" y2="63" stroke="#c0809a" stroke-width="1.2" opacity="0.6"/>
    <line x1="10" y1="65" x2="34" y2="66" stroke="#c0809a" stroke-width="1.2" opacity="0.6"/>
    <line x1="12" y1="70" x2="34" y2="69" stroke="#c0809a" stroke-width="1.2" opacity="0.6"/>
    <line x1="66" y1="63" x2="90" y2="60" stroke="#c0809a" stroke-width="1.2" opacity="0.6"/>
    <line x1="66" y1="66" x2="90" y2="65" stroke="#c0809a" stroke-width="1.2" opacity="0.6"/>
    <line x1="66" y1="69" x2="88" y2="70" stroke="#c0809a" stroke-width="1.2" opacity="0.6"/>
    ${c.eyes}
    ${c.cheeks}
    <ellipse cx="50" cy="60" rx="3" ry="2" fill="#ff85b3"/>
    ${c.mouth}
    ${c.extras}
    <ellipse cx="30" cy="115" rx="10" ry="6" fill="${c.body}"/>
    <ellipse cx="70" cy="115" rx="10" ry="6" fill="${c.body}"/>
    <ellipse cx="26" cy="117" rx="3" ry="2" fill="${c.earinner}" opacity="0.5"/>
    <ellipse cx="32" cy="118" rx="3" ry="2" fill="${c.earinner}" opacity="0.5"/>
    <ellipse cx="66" cy="118" rx="3" ry="2" fill="${c.earinner}" opacity="0.5"/>
    <ellipse cx="72" cy="117" rx="3" ry="2" fill="${c.earinner}" opacity="0.5"/>
  </svg>`
}

function fmttime(min) {
  if (!min || min < 1) return '0m'
  if (min < 60) return `${Math.round(min)}m`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return `${h}h ${m}m`
}

function spawnparticle(char) {
  const el = document.createElement('span')
  el.className = 'particle'
  el.textContent = char
  el.style.left = (20 + Math.random() * 60) + '%'
  el.style.bottom = '10px'
  el.style.animationDelay = (Math.random() * 0.5) + 's'
  ui.particles.appendChild(el)
  setTimeout(() => el.remove(), 2500)
}

function render(state, site) {
  const mood = state.catMood || 'happy'
  const cfg = moods[mood] || moods.happy

  ui.wrap.innerHTML = catsvg(mood)
  ui.wrap.className = `cat-svg-wrap mood-${mood}`
  ui.bubble.textContent = cfg.bubble
  ui.status.textContent = cfg.text

  const curr = state.mochiCount ?? 0
  ui.mochi.textContent = curr

  if (prevcount !== null && curr > prevcount) {
    ui.mochi.classList.remove('mochi-pop')
    void ui.mochi.offsetWidth
    ui.mochi.classList.add('mochi-pop')

    const bits = ['+', '*', 'o', '^']
    for (let i = 0; i < 3; i++) {
      const picked = bits[Math.floor(Math.random() * bits.length)]
      setTimeout(() => spawnparticle(picked), i * 200)
    }
  }
  prevcount = curr

  const hunger = state.catHunger ?? 50
  ui.hbar.style.width = `${hunger}%`

  let hcolor
  if (hunger < 20) hcolor = 'linear-gradient(90deg, #ff6b6b, #ff4040)'
  else if (hunger < 50) hcolor = 'linear-gradient(90deg, #ffa040, #ff8020)'
  else hcolor = 'linear-gradient(90deg, var(--pink-400), var(--pink-500))'
  ui.hbar.style.background = hcolor

  const stats = state.todayStats || {}
  ui.productive.textContent  = fmttime(stats.productive  || 0)
  ui.neutral.textContent     = fmttime(stats.neutral      || 0)
  ui.distraction.textContent = fmttime(stats.distraction  || 0)

  if (site && site.category) {
    const cat = site.category
    ui.dot.className = `site-dot ${cat.key || 'unknown'}`

    let host
    try { host = new URL(site.url).hostname.replace(/^www\./, '') }
    catch { host = 'current site' }

    ui.sitename.textContent  = host
    ui.sitemochi.textContent = `+${cat.mochi}/15m`
  } else {
    ui.dot.className = 'site-dot'
    ui.sitename.textContent  = 'system page'
    ui.sitemochi.textContent = ''
  }
}

function poll() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, state => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_SITE' }, site => {
      if (state) render(state, site || {})
    })
  })
}

document.getElementById('infoBtn').addEventListener('click', () => {
  ui.infopanel.classList.remove('hidden')
})
document.getElementById('closeInfo').addEventListener('click', () => {
  ui.infopanel.classList.add('hidden')
})

poll()
setInterval(poll, 5000)


