const H = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
  <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
</svg>`, K = `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="4,11 9,16 18,6"/>
</svg>`, O = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon class="sk-sp" points="16,3 20.1,12.1 30,13.5 23,20.3 24.7,30 16,25.4 7.3,30 9,20.3 2,13.5 11.9,12.1"/>
</svg>`, G = {
  detractor: ["流程步驟太多", "系統不穩", "查找資訊困難", "等待時間過長", "權限申請麻煩", "找不到功能"],
  passive: ["功能尚可", "偶有小問題", "希望更多功能", "UI 可更直覺", "操作需要適應", "有些步驟可簡化"],
  promoter: ["功能強大", "操作直覺", "流程順暢", "穩定可靠", "更新積極", "節省工作時間", "提高工作效率"]
}, F = {
  detractor: "請問是哪些方面影響了您的評分？",
  passive: "請問有哪些地方可以改進？",
  promoter: "請問哪些方面讓您給出這個評分？"
}, R = "是否有其他想補充的？（選填）", U = {
  1: "哪些地方讓您感到不滿意？（選填）",
  2: "哪些地方讓您感到不滿意？（選填）",
  3: "有什麼地方可以做得更好？（選填）",
  4: "還有其他想說的嗎？（選填）",
  5: "還有其他想說的嗎？（選填）"
}, V = {
  1: { t: "感謝您的誠實回饋。", s: "我們會認真檢視這次體驗，持續改善。", ring: "sk-er" },
  2: { t: "感謝您的誠實回饋。", s: "我們會認真檢視這次體驗，持續改善。", ring: "sk-er" },
  3: { t: "感謝您的回饋。", s: "我們會持續努力，讓體驗更順暢。", ring: "sk-wa" },
  4: { t: "很高興聽到這個！", s: "謝謝您的肯定，我們會繼續保持。", ring: "sk-ok" },
  5: { t: "太棒了，非常感謝！", s: "您的滿意是我們最大的動力。", ring: "sk-ok" }
};
function t(e, s = "", o = "") {
  const d = document.createElement(e);
  return s && (d.className = s), o && (d.innerHTML = o), d;
}
function T(e, s) {
  e.querySelectorAll(".sk-panel").forEach((o) => o.classList.remove("sk-on")), e.querySelector(`#${s}`).classList.add("sk-on");
}
function N(e, s) {
  const o = t("div", "sk-hd"), d = t("div", "sk-hl");
  d.appendChild(t("span", "sk-dot"));
  const n = t("p", "sk-ttl");
  n.textContent = e, d.appendChild(n), o.appendChild(d);
  const r = t("button", "sk-xbtn", H);
  r.setAttribute("aria-label", "關閉"), r.addEventListener("click", s), o.appendChild(r);
  const i = t("div");
  return i.appendChild(o), i.appendChild(t("div", "sk-sep")), i;
}
function I(e, s, o) {
  const d = t("div", "sk-ty"), n = t("div", "sk-ring sk-ok", K);
  n.id = e;
  const r = t("p", "sk-ty-t");
  r.id = s;
  const i = t("p", "sk-ty-s");
  return i.id = o, d.appendChild(n), d.appendChild(r), d.appendChild(i), d;
}
const P = (e) => `sk_cooldown_${e}`;
function W(e, s) {
  if (!s) return !1;
  try {
    const o = localStorage.getItem(P(e));
    return o ? Date.now() - parseInt(o, 10) < s * 864e5 : !1;
  } catch {
    return !1;
  }
}
function D(e) {
  try {
    localStorage.setItem(P(e), Date.now());
  } catch {
  }
}
function j(e) {
  e.classList.remove("sk-hidden", "sk-out"), e.classList.add("sk-in"), e.addEventListener("animationend", () => e.classList.remove("sk-in"), { once: !0 });
}
function B(e, s) {
  e.classList.add("sk-out"), e.addEventListener("animationend", () => {
    e.classList.add("sk-hidden"), e.classList.remove("sk-out"), s == null || s();
  }, { once: !0 });
}
function Q(e) {
  const s = t("div", "sk-wrap sk-hidden"), o = t("div", "sk-card");
  s.appendChild(o);
  let d = null;
  const n = `sk-nps-${Date.now()}`, r = () => B(s, () => s.remove()), i = t("div", "sk-panel sk-on");
  i.id = `${n}-1`, i.appendChild(N("給我們一點回饋", r));
  const k = t("div", "sk-body"), q = t("p", "sk-q");
  q.textContent = "您有多大可能向他人推薦我們的服務？（0 = 完全不推薦，10 = 非常推薦）", k.appendChild(q);
  const m = t("div"), x = t("div", "sk-sg");
  let C;
  for (let $ = 0; $ <= 10; $++) {
    const A = t("button", "sk-sb");
    A.textContent = $, A.addEventListener("click", () => {
      x.querySelectorAll(".sk-sb").forEach((L) => L.classList.remove("sk-sel")), A.classList.add("sk-sel"), d = $, C.classList.add("sk-rdy");
    }), x.appendChild(A);
  }
  m.appendChild(x);
  const b = t("div", "sk-slbls"), g = t("span", "sk-slbl");
  g.textContent = "完全不推薦";
  const S = t("span", "sk-slbl");
  S.textContent = "非常推薦", b.appendChild(g), b.appendChild(S), m.appendChild(b), k.appendChild(m);
  const h = t("div", "sk-ft"), E = t("button", "sk-btxt");
  E.textContent = "略過", E.addEventListener("click", r), C = t("button", "sk-bsub"), C.textContent = "繼續", C.addEventListener("click", () => {
    if (d === null) return;
    const $ = d <= 6 ? "detractor" : d <= 8 ? "passive" : "promoter";
    u.textContent = F[$], p.innerHTML = "", G[$].forEach((A) => {
      const L = t("button", "sk-tc");
      L.textContent = A, L.addEventListener("click", () => L.classList.toggle("sk-on")), p.appendChild(L);
    }), T(o, `${n}-2`);
  }), h.appendChild(E), h.appendChild(C), k.appendChild(h), i.appendChild(k), o.appendChild(i);
  const f = t("div", "sk-panel");
  f.id = `${n}-2`, f.appendChild(N("告訴我們更多", r));
  const v = t("div", "sk-body"), u = t("p", "sk-tq"), p = t("div", "sk-tr"), c = t("textarea", "sk-cb");
  c.placeholder = "其他補充意見（選填）";
  const a = t("div", "sk-ft"), l = t("button", "sk-btxt");
  l.textContent = "返回", l.addEventListener("click", () => T(o, `${n}-1`));
  const y = t("button", "sk-bsub sk-rdy");
  y.textContent = "送出", y.addEventListener("click", () => {
    var L;
    const $ = [...p.querySelectorAll(".sk-tc.sk-on")].map((M) => M.textContent), A = { type: "NPS", score: d, tags: $, comment: c.value, page: window.location.pathname, ts: (/* @__PURE__ */ new Date()).toISOString() };
    (L = e.onSubmit) == null || L.call(e, A), D("NPS"), T(o, `${n}-3`), setTimeout(r, 2800);
  }), a.appendChild(l), a.appendChild(y), v.appendChild(u), v.appendChild(p), v.appendChild(c), v.appendChild(a), f.appendChild(v), o.appendChild(f);
  const w = t("div", "sk-panel");
  w.id = `${n}-3`;
  const _ = I(`${n}-ring`, `${n}-tt`, `${n}-ts`);
  return _.querySelector(`#${n}-tt`).textContent = "感謝您的回饋。", _.querySelector(`#${n}-ts`).textContent = "您的意見已記錄，有助於我們持續改善。", w.appendChild(_), o.appendChild(w), s;
}
function z(e) {
  const s = t("div", "sk-wrap sk-hidden"), o = t("div", "sk-card");
  s.appendChild(o);
  let d = null;
  const n = `sk-ces-${Date.now()}`, r = () => B(s, () => s.remove()), i = t("div", "sk-panel sk-on");
  i.id = `${n}-1`, i.appendChild(N("操作體驗", r));
  const k = t("div", "sk-body"), q = t("p", "sk-q");
  q.textContent = "完成這個操作，您覺得費力程度如何？（1 = 非常輕鬆，7 = 非常費力）", k.appendChild(q);
  const m = t("div"), x = t("div", "sk-er"), C = t("div", "sk-cw");
  C.style.display = "none";
  const b = t("p", "sk-cl");
  C.appendChild(b);
  const g = t("textarea", "sk-cb");
  g.placeholder = "請描述您的想法…", C.appendChild(g);
  let S;
  [1, 2, 3, 4, 5, 6, 7].forEach((a) => {
    const l = t("button", "sk-eb"), y = t("span", "sk-en");
    y.textContent = a, l.appendChild(y), l.addEventListener("click", () => {
      x.querySelectorAll(".sk-eb").forEach((w) => w.classList.remove("sk-sel")), l.classList.add("sk-sel"), d = a, C.style.display = "flex", b.textContent = R, S.classList.add("sk-rdy");
    }), x.appendChild(l);
  }), m.appendChild(x);
  const h = t("div", "sk-slbls"), E = t("span", "sk-slbl");
  E.textContent = "非常輕鬆";
  const f = t("span", "sk-slbl");
  f.textContent = "非常費力", h.appendChild(E), h.appendChild(f), m.appendChild(h), k.appendChild(m), k.appendChild(C);
  const v = t("div", "sk-ft"), u = t("button", "sk-btxt");
  u.textContent = "略過", u.addEventListener("click", r), S = t("button", "sk-bsub"), S.textContent = "送出", S.addEventListener("click", () => {
    var l;
    if (!d) return;
    const a = { type: "CES", score: d, tags: [], comment: g.value, page: window.location.pathname, ts: (/* @__PURE__ */ new Date()).toISOString() };
    (l = e.onSubmit) == null || l.call(e, a), D("CES"), c.querySelector(".sk-ring").className = `sk-ring ${d <= 2 ? "sk-ok" : d <= 4 ? "sk-wa" : "sk-er"}`, T(o, `${n}-2`), setTimeout(r, 2800);
  }), v.appendChild(u), v.appendChild(S), k.appendChild(v), i.appendChild(k), o.appendChild(i);
  const p = t("div", "sk-panel");
  p.id = `${n}-2`;
  const c = I(`${n}-ring`, `${n}-tt`, `${n}-ts`);
  return c.querySelector(`#${n}-tt`).textContent = "感謝您的回饋。", c.querySelector(`#${n}-ts`).textContent = "您的意見已記錄，有助於我們持續改善。", p.appendChild(c), o.appendChild(p), s;
}
function J(e) {
  const s = t("div", "sk-wrap sk-hidden"), o = t("div", "sk-card");
  s.appendChild(o);
  let d = null;
  const n = `sk-csat-${Date.now()}`, r = () => B(s, () => s.remove()), i = t("div", "sk-panel sk-on");
  i.id = `${n}-1`, i.appendChild(N("這次體驗如何？", r));
  const k = t("div", "sk-body"), q = t("p", "sk-q");
  q.textContent = "您對這次操作體驗的滿意程度？", k.appendChild(q);
  const m = t("div", "sk-star-area"), x = t("div", "sk-stars"), C = [], b = t("div", "sk-cw");
  b.style.display = "none";
  const g = t("p", "sk-cl");
  b.appendChild(g);
  const S = t("textarea", "sk-cb");
  S.placeholder = "請描述您的想法…", b.appendChild(S);
  let h;
  [1, 2, 3, 4, 5].forEach((p) => {
    const c = t("button", "sk-star", O);
    c.setAttribute("data-v", p), c.setAttribute("aria-label", `${p} 星`), c.addEventListener("mouseenter", () => {
      d === null && C.forEach((a) => {
        const l = a.querySelector(".sk-sp"), y = +a.dataset.v;
        l.style.fill = y <= p ? "#F59E0B" : "", l.style.stroke = y <= p ? "#F59E0B" : "";
      });
    }), c.addEventListener("mouseleave", () => {
      d === null && C.forEach((a) => {
        const l = a.querySelector(".sk-sp");
        l.style.fill = l.style.stroke = "";
      });
    }), c.addEventListener("click", () => {
      d = p, C.forEach((a) => {
        const l = a.querySelector(".sk-sp");
        +a.dataset.v <= p ? (l.style.fill = l.style.stroke = "#F59E0B", a.classList.add("sk-sel")) : (l.style.fill = l.style.stroke = "", a.classList.remove("sk-sel"));
      }), b.style.display = "flex", g.textContent = U[p], h.classList.add("sk-rdy");
    }), x.appendChild(c), C.push(c);
  }), m.appendChild(x), k.appendChild(m), k.appendChild(b);
  const E = t("div", "sk-ft"), f = t("button", "sk-btxt");
  f.textContent = "略過", f.addEventListener("click", r), h = t("button", "sk-bsub"), h.textContent = "送出", h.addEventListener("click", () => {
    var l, y;
    if (!d) return;
    const p = { type: "CSAT", score: d, tags: [], comment: S.value, page: window.location.pathname, ts: (/* @__PURE__ */ new Date()).toISOString() };
    (l = e.onSubmit) == null || l.call(e, p), D("CSAT");
    const c = V[d];
    u.querySelector(".sk-ring").className = `sk-ring ${c.ring}`, u.querySelector(`#${n}-tt`).textContent = c.t, u.querySelector(`#${n}-ts`).textContent = c.s;
    const a = t("div", "sk-ty-stars");
    for (let w = 1; w <= 5; w++)
      a.appendChild(t("span", `sk-ty-star${w > d ? " sk-empty" : ""}`, O));
    (y = u.querySelector(".sk-ty-stars")) == null || y.remove(), u.insertBefore(a, u.querySelector(`#${n}-tt`)), T(o, `${n}-2`), setTimeout(r, 3e3);
  }), E.appendChild(f), E.appendChild(h), k.appendChild(E), i.appendChild(k), o.appendChild(i);
  const v = t("div", "sk-panel");
  v.id = `${n}-2`;
  const u = I(`${n}-ring`, `${n}-tt`, `${n}-ts`);
  return v.appendChild(u), o.appendChild(v), s;
}
const X = { NPS: Q, CES: z, CSAT: J }, Y = {
  open(e, s = {}) {
    var n;
    if (W(e, s.cooldown)) return;
    const o = X[e];
    if (!o) {
      console.warn(`[SurveyKit] Unknown type: ${e}. Use NPS, CES or CSAT.`);
      return;
    }
    (n = document.querySelector(`[data-sk-type="${e}"]`)) == null || n.remove();
    const d = o(s);
    d.setAttribute("data-sk-type", e), document.body.appendChild(d), j(d);
  },
  close(e) {
    const s = e ? document.querySelector(`[data-sk-type="${e}"]`) : document.querySelector(".sk-wrap:not(.sk-hidden)");
    s && B(s, () => s.remove());
  },
  clearCooldown(e) {
    try {
      (e ? [e] : ["NPS", "CES", "CSAT"]).forEach((o) => localStorage.removeItem(P(o)));
    } catch {
    }
  }
};
export {
  Y as SurveyKit,
  Y as default
};
