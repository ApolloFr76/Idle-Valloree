#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const webcrypto = require("node:crypto").webcrypto;

const ROOT = path.resolve(__dirname, "..");

function walkJs(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkJs(p));
    else if (ent.name.endsWith(".js")) out.push(p);
  }
  return out.sort();
}

function makeDomEnv() {
  const els = new Map();

  function makeClassList(initial = "") {
    const set = new Set(String(initial).split(/\s+/).filter(Boolean));
    return {
      [Symbol.iterator]: () => set.values(),
      add: (...cs) => cs.forEach(c => c && set.add(c)),
      remove: (...cs) => cs.forEach(c => set.delete(c)),
      toggle: (c, force) => {
        if (force === undefined) {
          if (set.has(c)) { set.delete(c); return false; }
          set.add(c);
          return true;
        }
        if (force) set.add(c);
        else set.delete(c);
        return !!force;
      },
      contains: c => set.has(c)
    };
  }

  function makeEl(tag = "div") {
    const style = new Proxy({
      setProperty: (k, v) => { style[k] = v; },
      removeProperty: k => { delete style[k]; }
    }, {
      get: (t, k) => (k in t ? t[k] : ""),
      set: (t, k, v) => { t[k] = v; return true; }
    });

    const ctx2d = new Proxy({
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      fillStyle: "#000",
      strokeStyle: "#000",
      imageSmoothingEnabled: false,
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: () => {},
      getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
      drawImage: () => {},
      fillRect: () => {},
      clearRect: () => {},
      save: () => {},
      restore: () => {}
    }, {
      get: (t, k) => (k in t ? t[k] : () => {})
    });

    const attrs = new Map();
    const el = {
      tagName: tag.toUpperCase(),
      nodeName: tag.toUpperCase(),
      nodeType: 1,
      style,
      classList: makeClassList(),
      dataset: {},
      childNodes: [],
      children: [],
      attributes: [],
      width: 320,
      height: 180,
      clientWidth: 800,
      clientHeight: 600,
      offsetWidth: 100,
      offsetHeight: 40,
      scrollTop: 0,
      hidden: false,
      disabled: false,
      checked: false,
      value: "",
      textContent: "",
      innerHTML: "",
      src: "",
      parentElement: null,
      parentNode: null,
      getContext: () => ctx2d,
      toDataURL: () => "data:image/png;base64,",
      getBoundingClientRect: () => ({ left: 0, right: 400, top: 0, bottom: 300, width: 400, height: 300 }),
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: c => { if (c && typeof c === "object") { c.parentElement = el; c.parentNode = el; el.childNodes.push(c); } return c; },
      insertBefore: (c) => el.appendChild(c),
      remove: () => {},
      before: () => {},
      closest: () => null,
      contains: () => false,
      focus: () => {},
      blur: () => {},
      select: () => {},
      click: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementsByClassName: () => [],
      animate: () => ({ onfinish: null }),
      getAttribute: k => attrs.has(k) ? attrs.get(k) : null,
      setAttribute: (k, v) => attrs.set(k, String(v)),
      hasAttribute: k => attrs.has(k),
      removeAttribute: k => attrs.delete(k),
      replaceWith: () => {}
    };
    if (tag.toLowerCase() === "template") {
      el.content = { childNodes: [] };
    }
    return el;
  }

  const getEl = id => {
    if (!els.has(id)) els.set(id, makeEl("div"));
    return els.get(id);
  };

  return {
    body: makeEl("body"),
    head: makeEl("head"),
    documentElement: makeEl("html"),
    hidden: false,
    activeElement: null,
    getElementById: getEl,
    querySelector: () => makeEl("div"),
    querySelectorAll: () => [],
    createElement: tag => makeEl(tag),
    elementFromPoint: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

function loadGameContext() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"><\/script>/g)].map(m => m[1]);
  assert.ok(scripts.length >= 30, "Script count in index.html unexpectedly small");
  for (const rel of scripts) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `Missing script referenced in index.html: ${rel}`);
  }

  const store = new Map();
  const doc = makeDomEnv();
  const ctx = vm.createContext({
    console,
    Math,
    Date,
    JSON,
    Object,
    Array,
    Number,
    String,
    Boolean,
    Set,
    Map,
    Error,
    RegExp,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    escape,
    unescape,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    Uint8ClampedArray,
    Float32Array,
    btoa: s => Buffer.from(s, "binary").toString("base64"),
    atob: s => Buffer.from(s, "base64").toString("binary"),
    crypto: webcrypto,
    Blob: class Blob { constructor(parts) { this.parts = parts; } },
    URL: { createObjectURL: () => "blob:test", revokeObjectURL: () => {} },
    innerWidth: 1280,
    innerHeight: 800,
    performance: { now: () => 1000 },
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k)
    },
    matchMedia: () => ({ matches: false, addEventListener: () => {}, addListener: () => {} }),
    document: doc,
    addEventListener: () => {},
    removeEventListener: () => {},
    Image: function () {},
    AudioContext: undefined,
    webkitAudioContext: undefined,
    ResizeObserver: undefined,
    MutationObserver: class MutationObserver { observe() {} disconnect() {} },
    queueMicrotask: typeof queueMicrotask === "function" ? queueMicrotask : fn => Promise.resolve().then(fn),
    requestAnimationFrame: () => 0,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    location: { reload: () => {} },
    navigator: {}
  });
  ctx.window = ctx;
  ctx.self = ctx;

  for (const rel of scripts) {
    const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
    vm.runInContext(code, ctx, { filename: rel });
  }

  vm.runInContext(`
    for (const k of [
      "SAVE_KEY", "OLD_TREE_BACKUP", "MIG_RZ2_NOTICE_KEY", "ACC_BACKUP",
      "SEC_STEP", "SEC_ASYMP", "secPct", "fmtPct", "secN", "secTxt",
      "UPGS", "ALLIES", "ZONES", "RES", "ITEMS", "CLASSES", "OPT_DEF", "SELL_KEEP_DEF",
      "allyCost", "allyDpsOf", "bagCap", "addRes", "autoSellFull", "offline", "tick",
      "OUV", "craftQ", "fresh", "arb", "up", "talV", "shopCost", "stats", "dur", "monRes",
      "startMode", "endMode", "sanitizeSave", "sanitizeLogHtml", "encodeSave", "decodeSave",
      "resetRun", "COMPTE", "RANG", "ACCUEIL", "MONDE", "SITE", "UPDATE_LOGS", "fx", "mbSig", "CHARGE"
    ]) {
      try { globalThis[k] = eval(k); } catch {}
    }
  `, ctx);

  return { ctx, store, scripts };
}

const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
    console.log("  OK   " + name);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.error("  FAIL " + name + "\n" + (err && err.stack ? err.stack : err));
  }
}

console.log("Running Idle-Valloree test suite...\n");

test("1. Syntax check across all js/ files", () => {
  const files = walkJs(path.join(ROOT, "js"));
  assert.ok(files.length >= 30);
  for (const f of files) {
    new vm.Script(fs.readFileSync(f, "utf8"), { filename: f });
  }
});

const { ctx, store, scripts } = loadGameContext();

test("2. index.html loads all scripts cleanly in VM (with CHARGE.err empty)", () => {
  assert.ok(scripts.includes("js/controle.js"));
  assert.ok(scripts.includes("js/biomes/outils.js"));
  assert.ok(scripts.includes("js/biomes/prairie.js"));
  assert.ok(scripts.includes("js/chantier.js"));
  assert.ok(scripts.includes("js/monde.js"));
  assert.ok(scripts.indexOf("js/biomes/outils.js") < scripts.indexOf("js/biomes/prairie.js"));
  assert.ok(scripts.indexOf("js/biomes/prairie.js") < scripts.indexOf("js/monde.js"));
  assert.deepEqual(Array.from(ctx.CHARGE ? ctx.CHARGE.err : []), []);
});

test("3. A.1 Asymptotic secondary stat curve (< 90%, diminishing returns, 8000 -> 60%)", () => {
  vm.runInContext(`
    S = fresh(); S.cls = "guerrier";
    const pts = [0, 5, 50, 200, 1000, 5000, 8000, 10000, 50000, 1e9];
    const vals = pts.map(v => secN("terre", v));
    for (let i = 0; i < pts.length; i++) {
      if (!(vals[i] < 90)) throw new Error("Exceeds 90 at " + pts[i]);
      if (i > 0 && !(vals[i] > vals[i - 1])) throw new Error("Not strictly increasing at " + pts[i]);
      if (i >= 2) {
        const slope1 = (vals[i - 1] - vals[i - 2]) / (pts[i - 1] - pts[i - 2]);
        const slope2 = (vals[i] - vals[i - 1]) / (pts[i] - pts[i - 1]);
        if (!(slope2 < slope1)) throw new Error("Slope not diminishing at " + pts[i]);
      }
    }
    if (Math.abs(secN("terre", 8000) - 60) > 1e-9) throw new Error("8000 should equal 60%");
    if (secTxt("sagesse", 5) !== "-1,1 % de recharge des sorts") throw new Error("Unexpected text: " + secTxt("sagesse", 5));
  `, ctx);
});

test("4. B Companions (1.1x cost, x2 every 25, x3 at 100 multiples)", () => {
  vm.runInContext(`
    S = fresh(); S.cls = "guerrier";
    const c0 = allyCost(0, 0), c1 = allyCost(0, 1);
    if (c1 !== Math.round(c0 * 1.1)) throw new Error("Cost step mismatch: " + c0 + " -> " + c1);
    const step = L => +((allyDpsOf(0, L) / L) / (allyDpsOf(0, L - 1) / (L - 1))).toFixed(6);
    for (const L of [25, 50, 75, 125]) {
      if (step(L) !== 2) throw new Error("Expected x2 at " + L + ", got " + step(L));
    }
    for (const L of [100, 200, 300]) {
      if (step(L) !== 3) throw new Error("Expected x3 at " + L + ", got " + step(L));
    }
  `, ctx);
});

test("5. A.2 Unlimited online storage, AFK seconds cap, t7 doubling gains, autoSellFull", () => {
  vm.runInContext(`
    S = fresh(); S.cls = "guerrier"; S.alloc.feu = 100; S.hp = 100;
    addRes("frene", 999999999);
    if (S.res.frene !== 999999999) throw new Error("Online addRes should not cap");

    S = fresh(); S.cls = "guerrier"; S.lvl = 10; S.alloc.feu = 150; S.zone = 0; S.up.sac1 = 1;
    const cap = bagCap();
    const o1 = offline(cap + 5000);
    if (!o1 || o1.sec !== cap || !o1.capped || o1.doubled) throw new Error("offline cap mismatch");

    S = fresh(); S.cls = "guerrier"; S.lvl = 10; S.alloc.feu = 150; S.zone = 0; S.up.sac1 = 1; S.arb.own.t7 = 1;
    const o2 = offline(cap + 5000);
    if (!o2 || o2.sec !== cap || !o2.capped || !o2.doubled) throw new Error("offline t7 mismatch");
    if (o2.kills < o1.kills * 2 - 1) throw new Error("t7 should double kills");

    S = fresh(); S.cls = "guerrier"; S.opt.autoSellFull = true; S.up.vendeur = 1;
    S.res.frene = SELL_KEEP_DEF + 150;
    const ec0 = S.ecus;
    if (!autoSellFull() || S.res.frene !== SELL_KEEP_DEF || S.ecus <= ec0) throw new Error("autoSellFull failed");
  `, ctx);
});

test("6. Ambiguous (a) Tour auto defaults false and turns off on defeat/abandon", () => {
  vm.runInContext(`
    if (OPT_DEF.autoTower !== false) throw new Error("OPT_DEF.autoTower should default to false");
    S = fresh(); S.cls = "guerrier"; S.opt = fixOpts({}); S.up.tourauto = true;
    S.opt.autoTower = true; S.mode = "zone"; S.ko = 0;
    tick(0.05);
    if (S.mode !== "tour") throw new Error("tick should start tour when autoTower ON");
    endMode(false, "temps écoulé");
    if (S.opt.autoTower !== false || S.towerAgainT !== 0) throw new Error("autoTower should turn off on defeat");

    S.opt.autoTower = true; S.mode = "zone"; S.ko = 0;
    tick(0.05);
    if (S.mode !== "tour") throw new Error("tick should restart tour when re-enabled");
    endMode(false, "abandon");
    if (S.opt.autoTower !== false) throw new Error("autoTower should turn off on abandon");
  `, ctx);
});

test("7. A.3 & A.4 Workers r5 double harvest & Atelier r11 craftQ", () => {
  vm.runInContext(`
    S = fresh(); S.cls = "guerrier";
    S.workers = [{ name: "Luc", look: 0, r: "frene", t: 0, n: 0 }];
    S.arb.own.r5 = 1;
    const gt = OUV.time(S.workers[0]);
    const orig = Math.random;
    Math.random = () => 0.1;
    OUV.tick(gt + 0.001);
    const proc = S.res.frene || 0;
    Math.random = () => 0.9;
    OUV.tick(gt + 0.001);
    const noProc = (S.res.frene || 0) - proc;
    Math.random = orig;
    if (proc !== 2 || noProc !== 1) throw new Error("OUV.tick r5 mismatch: " + proc + "/" + noProc);

    S = fresh(); S.cls = "guerrier";
    S.workers = [{ name: "Luc", look: 0, r: "frene", t: 0, n: 0 }];
    const s1 = { res: {} }; OUV.offline(200, s1);
    S = fresh(); S.cls = "guerrier";
    S.workers = [{ name: "Luc", look: 0, r: "frene", t: 0, n: 0 }];
    S.arb.own.r5 = 1;
    const s2 = { res: {} }; OUV.offline(200, s2);
    if (!(s2.res["Frêne"] > s1.res["Frêne"])) throw new Error("OUV.offline r5 should boost gain");

    S = fresh(); S.cls = "guerrier";
    if (craftQ(5) !== 5) throw new Error("base craftQ");
    S.arb.own.r11 = 1;
    if (craftQ(5) !== 3) throw new Error("r11 craftQ");
  `, ctx);
});

test("8. C.2 Save encode/decode V2 checksum, legacy compatibility & XSS/prototype sanitization", () => {
  ctx.__malJson = '{"cls":"guerrier","name":"Bad<script>x</script>","lvl":-50,"ecus":"NaN","souls":"1e120","items":[{"u":1,"id":"nope"}],"log":[{"h":"<img src=x onerror=alert(1)><b style=\\"color:red;background:url(x)\\">X</b><b>ok</b><span class=\\"g\\">OK</span>","c":"g onclick=alert(1)","t":1}],"buffs":[{"k":"dmg","v":2,"until":100,"n":"<b>Buff</b>"}],"__proto__":{"polluted":1}}';
  const out = vm.runInContext(`
    S = fresh(); S.cls = "mage"; S.lvl = 42; S.ecus = 12345;
    S.log = [{ h: 'Succès : <b>Aventurier</b> <span class="g">+10</span>', c: "g", t: 1000 }];
    const v2 = encodeSave(S);
    if (!v2.startsWith("V2.")) throw new Error("Expected V2 format");
    const dec = decodeSave(v2);
    if (dec.cls !== "mage" || dec.lvl !== 42 || dec.ecus !== 12345) throw new Error("Round-trip mismatch");

    let tampered = false;
    try { decodeSave(v2.slice(0, -4) + "AAAA"); } catch (e) { tampered = /signature|corrompue|checksum/i.test(e.message); }
    if (!tampered) throw new Error("Tampered V2 save should fail checksum");

    const legacy = btoa(unescape(encodeURIComponent(JSON.stringify({ cls: "guerrier", lvl: 7, name: "Héros" }))));
    const decLeg = decodeSave(legacy);
    if (decLeg.cls !== "guerrier" || decLeg.lvl !== 7 || decLeg.name !== "Héros") throw new Error("Legacy decode failed");

    const malicious = JSON.parse(globalThis.__malJson);
    const clean = sanitizeSave(malicious);
    if (!clean || clean.polluted === 1 || Object.prototype.polluted === 1) throw new Error("Prototype pollution leaked");
    if (clean.lvl !== 1 || clean.ecus !== 0 || clean.items.length !== 0) throw new Error("Numeric/item bounds failed");
    if (clean.souls !== 1e120 || clean.soulsTotal !== 1e120) throw new Error("Large high-level value was truncated: " + clean.souls);
    ({ lh: clean.log[0].h, lc: clean.log[0].c });
  `, ctx);

  const allowedTagRe = /<(?!(?:\/?b|\/span|span class="[gx]"|(?:b|span) style="color:(?:#[0-9a-fA-F]{3,8}|var\(--[a-zA-Z0-9_-]+\))")>)/i;
  assert.ok(!allowedTagRe.test(out.lh), "Unwhitelisted HTML tag survived sanitization: " + out.lh);
  assert.ok(out.lh.includes("&lt;img") && out.lh.includes("&lt;b style=&quot;color:red;background:url(x)&quot;&gt;"), "Malicious tags were not escaped: " + out.lh);
  assert.ok(out.lh.includes("<b>ok</b>") && out.lh.includes('<span class="g">OK</span>'), "Safe tags stripped: " + out.lh);
  assert.equal(out.lc, "w", "Invalid log class not sanitized");
});

test("9. C.3 Recovery code, options confirm pw, C.4 migration banner & C.5 resetRun", () => {
  vm.runInContext(`
    for (let i = 0; i < 20; i++) {
      const c = COMPTE.genRecoveryCode();
      if (!/^VAL-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(c)) {
        throw new Error("Invalid recovery code format: " + c);
      }
    }
    COMPTE.act("accOptMode", { dataset: { m: "create" } });
    const hCreate = COMPTE.formHtml(false);
    if (!hCreate.includes("accW2")) throw new Error("Options create form missing password confirmation");
    COMPTE.act("accOptMode", { dataset: { m: "recover" } });
    const hRec = COMPTE.formHtml(false);
    if (!hRec.includes("accRec") || !hRec.includes("accW2")) throw new Error("Options recover form incomplete");

    // C.4 Migration banner on #accueil
    localStorage.setItem(MIG_RZ2_NOTICE_KEY, JSON.stringify({ name: "Héros", lvl: 25, cls: "guerrier" }));
    localStorage.setItem(OLD_TREE_BACKUP, JSON.stringify({ cls: "guerrier", lvl: 25, rz: 1 }));
    ACCUEIL.render();
    const accEl = document.body.childNodes.find(x => x.id === "accueil");
    if (!accEl || !accEl.innerHTML.includes("accExportOld") || !accEl.innerHTML.includes("accDismissMig")) {
      throw new Error("Migration banner not rendered on #accueil");
    }
    ACCUEIL.act("accDismissMig");
    if (localStorage.getItem(MIG_RZ2_NOTICE_KEY) !== null || accEl.innerHTML.includes("accExportOld")) {
      throw new Error("Migration banner dismissal failed");
    }

    S = fresh(); S.cls = "guerrier"; S.lvl = 99; S.name = "Solène"; S.opt = fixOpts({ vol: 0.25 });
    save();
    resetRun({ keepOpts: true, keepName: true, backupKey: ACC_BACKUP });
    if (S.cls !== null || S.lvl !== 1 || S.name !== "Solène" || S.opt.vol !== 0.25) {
      throw new Error("resetRun did not reset properly while keeping opt/name");
    }
    if (!localStorage.getItem(ACC_BACKUP)) throw new Error("resetRun did not write backup");
  `, ctx);
});

test("10. D.2 MONDE generates all 12 biome layers cleanly & D monRes without S.tal", () => {
  vm.runInContext(`
    S = fresh(); S.cls = "guerrier";
    MONDE.init();
    for (const z of ZONES) {
      MONDE.zone(z.id);
    }
    if ("tal" in S) throw new Error("Dead S.tal should not exist");
    const r0 = monRes("feu", "eau");
    S.arb.own.g9 = 1;
    const r1 = monRes("feu", "eau");
    if (!(r1 < r0)) throw new Error("monRes g9 check failed");
  `, ctx);
});

test("11. Updates log includes 19 novembre 2026 entry & dead symbols absent", () => {
  vm.runInContext(`
    if (!Array.isArray(UPDATE_LOGS) || UPDATE_LOGS[0].date !== "19 novembre 2026" || UPDATE_LOGS[0].items.length < 5) {
      throw new Error("UPDATE_LOGS top entry missing or incomplete");
    }
  `, ctx);

  const dead = ["PRIM_OK", "bagWeight", "afkWeight", "TALENTS", "upPerm", "heroBlink", "blinkT", "bossesLife", "fullWarn", "w.full", "limitBag"];
  const srcFiles = walkJs(path.join(ROOT, "js"));
  for (const f of srcFiles) {
    const txt = fs.readFileSync(f, "utf8");
    for (const sym of dead) {
      assert.ok(!new RegExp("\\b" + sym.replace(".", "\\.") + "\\b").test(txt), `Dead symbol ${sym} found in ${f}`);
    }
  }
});

const failed = results.filter(r => !r.ok);
console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed.`);
if (failed.length) process.exit(1);
