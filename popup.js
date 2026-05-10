const mood_imgs = {
  thriving: 'cat-thriving.png',
  happy:    'happycat.png',
  neutral:  'cat-neutral.png',
  sad:      'cat-sad.png',
  starving: 'cat-sad.png',
}

const mood_bubbles = {
  thriving: ':)',
  happy:    '♡',
  neutral:  '…',
  sad:      '；；',
  starving: '！',
}

const mood_txt = {
  thriving: 'thriving & loved',
  happy:    'happy & fed',
  neutral:  'just getting by',
  sad:      'hungry & sad',
  starving: 'starving!! feed me!',
}

const cat_img    = document.getElementById('cat_img')
const mood_bub   = document.getElementById('mood_bubble')
const status_el  = document.getElementById('status_txt')
const mochi_el   = document.getElementById('mochi_cnt')
const focus_el   = document.getElementById('stat_focus')
const earn_el    = document.getElementById('stat_earn')
const scroll_el  = document.getElementById('stat_scroll')
const site_dot   = document.getElementById('site_dot')
const site_name  = document.getElementById('site_name')
const site_mochi = document.getElementById('site_mochi')
const cat_stage  = document.getElementById('cat_stage')
const info_btn   = document.getElementById('info_btn')

const hboxes = [0,1,2,3,4].map(i => document.getElementById('hb' + i))

let prev_mochi = null
let _dummy = null 

function fmt_mins(raw_mins) {
  const m = Math.round(raw_mins)
  if (m < 60) return m + 'm'
  const h = Math.floor(m / 60)
  const leftover = m % 60
  return leftover === 0 ? h + 'h' : `${h}h ${leftover}m`
}

function fill_boxes(hunger) {
  const filled = Math.round((hunger / 100) * 5)
  let cls
  if (hunger > 75)      cls = 'filled-thriving'
  else if (hunger > 55) cls = 'filled-happy'
  else if (hunger > 35) cls = 'filled-neutral'
  else if (hunger > 15) cls = 'filled-sad'
  else                  cls = 'filled-starving'

  hboxes.forEach((box, i) => {
    box.className = 'hbox'
    if (i < filled) box.classList.add(cls)
  })
}

function set_mood(mood) {
  const img = mood_imgs[mood] || 'happycat.png'
  if (cat_img.src.split('/').pop() !== img) cat_img.src = img

  mood_bub.textContent = mood_bubbles[mood] || '♡'
  status_el.textContent = mood_txt[mood] || 'just vibing'

  cat_stage.className = 'cat-stage mood-' + mood
}

function pop_mochi(count) {
  mochi_el.textContent = count
  if (prev_mochi !== null && count > prev_mochi) {
    mochi_el.classList.remove('mochi-pop')
    void mochi_el.offsetWidth
    mochi_el.classList.add('mochi-pop')
    mochi_el.addEventListener('animationend', () => mochi_el.classList.remove('mochi-pop'), { once: true })
  }
  prev_mochi = count
}

function render_site(url, category) {
  if (!url || !category) {
    site_dot.className = 'site-dot'
    site_name.textContent = 'no active tab'
    site_mochi.textContent = ''
    return
  }

  let host
  try { host = new URL(url).hostname.replace(/^www\./, '') }
  catch { host = url }

  site_name.textContent = host
  site_dot.className = 'site-dot ' + (category.key || 'unknown')

  const per_interval = category.mochi
  site_mochi.textContent = per_interval ? '+' + per_interval + ' /10min' : ''
}

function render(state, site_info) {
  const { mochiCount, catMood, catHunger, todayStats } = state

  set_mood(catMood)
  fill_boxes(catHunger)
  pop_mochi(mochiCount)

  const stats = todayStats || { productive: 0, neutral: 0, distraction: 0 }
  focus_el.textContent  = fmt_mins(stats.productive)
  earn_el.textContent   = fmt_mins(stats.neutral)
  scroll_el.textContent = fmt_mins(stats.distraction)

  if (site_info) render_site(site_info.url, site_info.category)
}

async function init() {
  const [state, site_info] = await Promise.all([
    new Promise(res => chrome.runtime.sendMessage({ type: 'GET_STATE' }, res)),
    new Promise(res => chrome.runtime.sendMessage({ type: 'GET_CURRENT_SITE' }, res)),
  ])

  if (!state) return
  render(state, site_info)
}

info_btn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/dexterMorgaN-9/feed-the-cat/blob/main/README.md' })
})

init()
