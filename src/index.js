/**
 * @gwyzzenn/survey-kit  v1.0.0
 * NPS · CES · CSAT survey popover kit
 *
 * Usage:
 *   import { SurveyKit } from '@gwyzzenn/survey-kit'
 *   import '@gwyzzenn/survey-kit/dist/survey-kit.css'
 *
 *   SurveyKit.open('NPS', { onSubmit: (data) => fetch('/api/survey', ...), cooldown: 90 })
 */

import './style.css'

// ── SVG constants ──────────────────────────────────────────
const CLOSE_SVG = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
  <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
</svg>`

const CHECK_SVG = `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="4,11 9,16 18,6"/>
</svg>`

const STAR_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon class="sk-sp" points="16,3 20.1,12.1 30,13.5 23,20.3 24.7,30 16,25.4 7.3,30 9,20.3 2,13.5 11.9,12.1"/>
</svg>`

// ── Data ───────────────────────────────────────────────────
const NPS_TAGS = {
  detractor: ['流程步驟太多', '系統不穩', '查找資訊困難', '等待時間過長', '權限申請麻煩', '找不到功能'],
  passive:   ['功能尚可', '偶有小問題', '希望更多功能', 'UI 可更直覺', '操作需要適應', '有些步驟可簡化'],
  promoter:  ['功能強大', '操作直覺', '流程順暢', '穩定可靠', '更新積極', '節省工作時間', '提高工作效率'],
}

const NPS_Q = {
  detractor: '請問是哪些方面影響了您的評分？',
  passive:   '請問有哪些地方可以改進？',
  promoter:  '請問哪些方面讓您給出這個評分？',
}

const CES_COMMENT = '是否有其他想補充的？（選填）'

const CSAT_COMMENT = {
  1: '哪些地方讓您感到不滿意？（選填）',
  2: '哪些地方讓您感到不滿意？（選填）',
  3: '有什麼地方可以做得更好？（選填）',
  4: '還有其他想說的嗎？（選填）',
  5: '還有其他想說的嗎？（選填）',
}

const CSAT_THANKS = {
  1: { t: '感謝您的誠實回饋。',   s: '我們會認真檢視這次體驗，持續改善。', ring: 'sk-er' },
  2: { t: '感謝您的誠實回饋。',   s: '我們會認真檢視這次體驗，持續改善。', ring: 'sk-er' },
  3: { t: '感謝您的回饋。',       s: '我們會持續努力，讓體驗更順暢。',     ring: 'sk-wa' },
  4: { t: '很高興聽到這個！',     s: '謝謝您的肯定，我們會繼續保持。',     ring: 'sk-ok' },
  5: { t: '太棒了，非常感謝！',   s: '您的滿意是我們最大的動力。',         ring: 'sk-ok' },
}

// ── DOM helpers ────────────────────────────────────────────
function el(tag, cls = '', html = '') {
  const e = document.createElement(tag)
  if (cls)  e.className = cls
  if (html) e.innerHTML = html
  return e
}

function showPanel(card, id) {
  card.querySelectorAll('.sk-panel').forEach(p => p.classList.remove('sk-on'))
  card.querySelector(`#${id}`).classList.add('sk-on')
}

function makeHeader(title, onClose) {
  const hd  = el('div', 'sk-hd')
  const hl  = el('div', 'sk-hl')
  hl.appendChild(el('span', 'sk-dot'))
  const t   = el('p', 'sk-ttl'); t.textContent = title
  hl.appendChild(t)
  hd.appendChild(hl)
  const xb  = el('button', 'sk-xbtn', CLOSE_SVG)
  xb.setAttribute('aria-label', '關閉')
  xb.addEventListener('click', onClose)
  hd.appendChild(xb)
  const wrap = el('div')
  wrap.appendChild(hd)
  wrap.appendChild(el('div', 'sk-sep'))
  return wrap
}

function makeThanks(ringId, titleId, subId) {
  const ty   = el('div', 'sk-ty')
  const ring = el('div', 'sk-ring sk-ok', CHECK_SVG); ring.id = ringId
  const tt   = el('p', 'sk-ty-t'); tt.id = titleId
  const ts   = el('p', 'sk-ty-s'); ts.id = subId
  ty.appendChild(ring)
  ty.appendChild(tt)
  ty.appendChild(ts)
  return ty
}

// ── Cooldown ───────────────────────────────────────────────
const ckKey = type => `sk_cooldown_${type}`

function isOnCooldown(type, days) {
  if (!days) return false
  try {
    const last = localStorage.getItem(ckKey(type))
    if (!last) return false
    return (Date.now() - parseInt(last, 10)) < days * 86_400_000
  } catch { return false }
}

function setCooldown(type) {
  try { localStorage.setItem(ckKey(type), Date.now()) } catch { /* noop */ }
}

// ── Animation ──────────────────────────────────────────────
function animIn(wrap) {
  wrap.classList.remove('sk-hidden', 'sk-out')
  wrap.classList.add('sk-in')
  wrap.addEventListener('animationend', () => wrap.classList.remove('sk-in'), { once: true })
}

function animOut(wrap, cb) {
  wrap.classList.add('sk-out')
  wrap.addEventListener('animationend', () => {
    wrap.classList.add('sk-hidden')
    wrap.classList.remove('sk-out')
    cb?.()
  }, { once: true })
}

// ── NPS builder ────────────────────────────────────────────
function buildNPS(opts) {
  const wrap = el('div', 'sk-wrap sk-hidden')
  const card = el('div', 'sk-card')
  wrap.appendChild(card)

  let score = null
  const pid  = `sk-nps-${Date.now()}`
  const close = () => animOut(wrap, () => wrap.remove())

  // Step 1 — score
  const p1 = el('div', 'sk-panel sk-on'); p1.id = `${pid}-1`
  p1.appendChild(makeHeader('給我們一點回饋', close))
  const body1 = el('div', 'sk-body')
  const q1 = el('p', 'sk-q'); q1.textContent = '您有多大可能向他人推薦我們的服務？（0 = 完全不推薦，10 = 非常推薦）'
  body1.appendChild(q1)

  const sgWrap = el('div')
  const sg = el('div', 'sk-sg')
  let nextBtn
  for (let i = 0; i <= 10; i++) {
    const b = el('button', 'sk-sb'); b.textContent = i
    b.addEventListener('click', () => {
      sg.querySelectorAll('.sk-sb').forEach(x => x.classList.remove('sk-sel'))
      b.classList.add('sk-sel')
      score = i
      nextBtn.classList.add('sk-rdy')
    })
    sg.appendChild(b)
  }
  sgWrap.appendChild(sg)
  const lblRow = el('div', 'sk-slbls')
  const l1 = el('span', 'sk-slbl'); l1.textContent = '完全不推薦'
  const l2 = el('span', 'sk-slbl'); l2.textContent = '非常推薦'
  lblRow.appendChild(l1); lblRow.appendChild(l2)
  sgWrap.appendChild(lblRow)
  body1.appendChild(sgWrap)

  const ft1    = el('div', 'sk-ft')
  const skipB1 = el('button', 'sk-btxt'); skipB1.textContent = '略過'
  skipB1.addEventListener('click', close)
  nextBtn = el('button', 'sk-bsub'); nextBtn.textContent = '繼續'
  nextBtn.addEventListener('click', () => {
    if (score === null) return
    const cat = score <= 6 ? 'detractor' : score <= 8 ? 'passive' : 'promoter'
    tq.textContent = NPS_Q[cat]
    tr.innerHTML = ''
    NPS_TAGS[cat].forEach(label => {
      const c = el('button', 'sk-tc'); c.textContent = label
      c.addEventListener('click', () => c.classList.toggle('sk-on'))
      tr.appendChild(c)
    })
    showPanel(card, `${pid}-2`)
  })
  ft1.appendChild(skipB1); ft1.appendChild(nextBtn)
  body1.appendChild(ft1)
  p1.appendChild(body1)
  card.appendChild(p1)

  // Step 2 — tags + comment
  const p2 = el('div', 'sk-panel'); p2.id = `${pid}-2`
  p2.appendChild(makeHeader('告訴我們更多', close))
  const body2 = el('div', 'sk-body')
  const tq  = el('p', 'sk-tq')
  const tr  = el('div', 'sk-tr')
  const cmt = el('textarea', 'sk-cb'); cmt.placeholder = '其他補充意見（選填）'
  const ft2 = el('div', 'sk-ft')
  const bk  = el('button', 'sk-btxt'); bk.textContent = '返回'
  bk.addEventListener('click', () => showPanel(card, `${pid}-1`))
  const sub = el('button', 'sk-bsub sk-rdy'); sub.textContent = '送出'
  sub.addEventListener('click', () => {
    const tags = [...tr.querySelectorAll('.sk-tc.sk-on')].map(c => c.textContent)
    const payload = { type: 'NPS', score, tags, comment: cmt.value, page: window.location.pathname, ts: new Date().toISOString() }
    opts.onSubmit?.(payload)
    setCooldown('NPS')
    showPanel(card, `${pid}-3`)
    setTimeout(close, 2800)
  })
  ft2.appendChild(bk); ft2.appendChild(sub)
  body2.appendChild(tq); body2.appendChild(tr); body2.appendChild(cmt); body2.appendChild(ft2)
  p2.appendChild(body2)
  card.appendChild(p2)

  // Step 3 — thanks
  const p3 = el('div', 'sk-panel'); p3.id = `${pid}-3`
  const ty = makeThanks(`${pid}-ring`, `${pid}-tt`, `${pid}-ts`)
  ty.querySelector(`#${pid}-tt`).textContent = '感謝您的回饋。'
  ty.querySelector(`#${pid}-ts`).textContent = '您的意見已記錄，有助於我們持續改善。'
  p3.appendChild(ty)
  card.appendChild(p3)

  return wrap
}

// ── CES builder ────────────────────────────────────────────
function buildCES(opts) {
  const wrap = el('div', 'sk-wrap sk-hidden')
  const card = el('div', 'sk-card')
  wrap.appendChild(card)

  let sel    = null
  const pid  = `sk-ces-${Date.now()}`
  const close = () => animOut(wrap, () => wrap.remove())

  const p1 = el('div', 'sk-panel sk-on'); p1.id = `${pid}-1`
  p1.appendChild(makeHeader('操作體驗', close))
  const body1 = el('div', 'sk-body')
  const q = el('p', 'sk-q'); q.textContent = '完成這個操作，您覺得費力程度如何？（1 = 非常輕鬆，7 = 非常費力）'
  body1.appendChild(q)

  const erWrap = el('div')
  const er  = el('div', 'sk-er')
  const cw  = el('div', 'sk-cw'); cw.style.display = 'none'
  const cl  = el('p',  'sk-cl'); cw.appendChild(cl)
  const cb  = el('textarea', 'sk-cb'); cb.placeholder = '請描述您的想法…'; cw.appendChild(cb)
  let subBtn

  ;[1, 2, 3, 4, 5, 6, 7].forEach(v => {
    const b = el('button', 'sk-eb')
    const n = el('span',   'sk-en'); n.textContent = v; b.appendChild(n)
    b.addEventListener('click', () => {
      er.querySelectorAll('.sk-eb').forEach(x => x.classList.remove('sk-sel'))
      b.classList.add('sk-sel')
      sel = v
      cw.style.display = 'flex'
      cl.textContent   = CES_COMMENT
      subBtn.classList.add('sk-rdy')
    })
    er.appendChild(b)
  })
  erWrap.appendChild(er)
  const lblRow = el('div', 'sk-slbls')
  const l1 = el('span', 'sk-slbl'); l1.textContent = '非常輕鬆'
  const l2 = el('span', 'sk-slbl'); l2.textContent = '非常費力'
  lblRow.appendChild(l1); lblRow.appendChild(l2)
  erWrap.appendChild(lblRow)
  body1.appendChild(erWrap)
  body1.appendChild(cw)

  const ft    = el('div', 'sk-ft')
  const skipB = el('button', 'sk-btxt'); skipB.textContent = '略過'
  skipB.addEventListener('click', close)
  subBtn = el('button', 'sk-bsub'); subBtn.textContent = '送出'
  subBtn.addEventListener('click', () => {
    if (!sel) return
    const payload = { type: 'CES', score: sel, tags: [], comment: cb.value, page: window.location.pathname, ts: new Date().toISOString() }
    opts.onSubmit?.(payload)
    setCooldown('CES')
    ty.querySelector('.sk-ring').className = `sk-ring ${sel <= 2 ? 'sk-ok' : sel <= 4 ? 'sk-wa' : 'sk-er'}`
    showPanel(card, `${pid}-2`)
    setTimeout(close, 2800)
  })
  ft.appendChild(skipB); ft.appendChild(subBtn)
  body1.appendChild(ft)
  p1.appendChild(body1)
  card.appendChild(p1)

  const p2 = el('div', 'sk-panel'); p2.id = `${pid}-2`
  const ty = makeThanks(`${pid}-ring`, `${pid}-tt`, `${pid}-ts`)
  ty.querySelector(`#${pid}-tt`).textContent = '感謝您的回饋。'
  ty.querySelector(`#${pid}-ts`).textContent = '您的意見已記錄，有助於我們持續改善。'
  p2.appendChild(ty)
  card.appendChild(p2)

  return wrap
}

// ── CSAT builder ───────────────────────────────────────────
function buildCSAT(opts) {
  const wrap = el('div', 'sk-wrap sk-hidden')
  const card = el('div', 'sk-card')
  wrap.appendChild(card)

  let sel    = null
  const pid  = `sk-csat-${Date.now()}`
  const close = () => animOut(wrap, () => wrap.remove())

  const p1 = el('div', 'sk-panel sk-on'); p1.id = `${pid}-1`
  p1.appendChild(makeHeader('這次體驗如何？', close))
  const body1 = el('div', 'sk-body')
  const q = el('p', 'sk-q'); q.textContent = '您對這次操作體驗的滿意程度？'
  body1.appendChild(q)

  const sa      = el('div', 'sk-star-area')
  const sr      = el('div', 'sk-stars')
  const starEls = []
  const cw  = el('div', 'sk-cw'); cw.style.display = 'none'
  const cl  = el('p',  'sk-cl'); cw.appendChild(cl)
  const cb  = el('textarea', 'sk-cb'); cb.placeholder = '請描述您的想法…'; cw.appendChild(cb)
  let subBtn

  ;[1, 2, 3, 4, 5].forEach(v => {
    const b = el('button', 'sk-star', STAR_SVG)
    b.setAttribute('data-v', v)
    b.setAttribute('aria-label', `${v} 星`)
    b.addEventListener('mouseenter', () => {
      if (sel !== null) return
      starEls.forEach(s => {
        const sp = s.querySelector('.sk-sp')
        const sv = +s.dataset.v
        sp.style.fill   = sv <= v ? '#F59E0B' : ''
        sp.style.stroke = sv <= v ? '#F59E0B' : ''
      })
    })
    b.addEventListener('mouseleave', () => {
      if (sel !== null) return
      starEls.forEach(s => {
        const sp = s.querySelector('.sk-sp')
        sp.style.fill = sp.style.stroke = ''
      })
    })
    b.addEventListener('click', () => {
      sel = v
      starEls.forEach(s => {
        const sp = s.querySelector('.sk-sp')
        const sv = +s.dataset.v
        if (sv <= v) { sp.style.fill = sp.style.stroke = '#F59E0B'; s.classList.add('sk-sel') }
        else          { sp.style.fill = sp.style.stroke = '';        s.classList.remove('sk-sel') }
      })
      cw.style.display = 'flex'
      cl.textContent   = CSAT_COMMENT[v]
      subBtn.classList.add('sk-rdy')
    })
    sr.appendChild(b)
    starEls.push(b)
  })
  sa.appendChild(sr)
  body1.appendChild(sa)
  body1.appendChild(cw)

  const ft    = el('div', 'sk-ft')
  const skipB = el('button', 'sk-btxt'); skipB.textContent = '略過'
  skipB.addEventListener('click', close)
  subBtn = el('button', 'sk-bsub'); subBtn.textContent = '送出'
  subBtn.addEventListener('click', () => {
    if (!sel) return
    const payload = { type: 'CSAT', score: sel, tags: [], comment: cb.value, page: window.location.pathname, ts: new Date().toISOString() }
    opts.onSubmit?.(payload)
    setCooldown('CSAT')
    const d = CSAT_THANKS[sel]
    ty.querySelector('.sk-ring').className    = `sk-ring ${d.ring}`
    ty.querySelector(`#${pid}-tt`).textContent = d.t
    ty.querySelector(`#${pid}-ts`).textContent = d.s
    // render stars in thanks
    const tyStars = el('div', 'sk-ty-stars')
    for (let i = 1; i <= 5; i++) {
      tyStars.appendChild(el('span', `sk-ty-star${i > sel ? ' sk-empty' : ''}`, STAR_SVG))
    }
    ty.querySelector('.sk-ty-stars')?.remove()
    ty.insertBefore(tyStars, ty.querySelector(`#${pid}-tt`))
    showPanel(card, `${pid}-2`)
    setTimeout(close, 3000)
  })
  ft.appendChild(skipB); ft.appendChild(subBtn)
  body1.appendChild(ft)
  p1.appendChild(body1)
  card.appendChild(p1)

  const p2 = el('div', 'sk-panel'); p2.id = `${pid}-2`
  const ty = makeThanks(`${pid}-ring`, `${pid}-tt`, `${pid}-ts`)
  p2.appendChild(ty)
  card.appendChild(p2)

  return wrap
}

// ── Public API ─────────────────────────────────────────────
const builders = { NPS: buildNPS, CES: buildCES, CSAT: buildCSAT }

export const SurveyKit = {
  open(type, options = {}) {
    if (isOnCooldown(type, options.cooldown)) return
    const builder = builders[type]
    if (!builder) { console.warn(`[SurveyKit] Unknown type: ${type}. Use NPS, CES or CSAT.`); return }
    document.querySelector(`[data-sk-type="${type}"]`)?.remove()
    const wrap = builder(options)
    wrap.setAttribute('data-sk-type', type)
    document.body.appendChild(wrap)
    animIn(wrap)
  },

  close(type) {
    const el = type
      ? document.querySelector(`[data-sk-type="${type}"]`)
      : document.querySelector('.sk-wrap:not(.sk-hidden)')
    if (el) animOut(el, () => el.remove())
  },

  clearCooldown(type) {
    try {
      const types = type ? [type] : ['NPS', 'CES', 'CSAT']
      types.forEach(t => localStorage.removeItem(ckKey(t)))
    } catch { /* noop */ }
  },
}

export default SurveyKit
