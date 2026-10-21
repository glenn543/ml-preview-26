/* =====================================================================
 * 頁面邏輯：讀取 js/content.js 的 SITE / SCENES / SPENDING，畫出整個頁面。
 * 一般改內容不需要動這個檔案。
 *
 * 結構（對照原站元件）：
 *   renderApp()          頁首 + 場景分頁 +「點數」分頁
 *   ScenePanel()         場景說明 +「分鏡／比較」子分頁
 *   Storyboard()         時間軸、預覽影片、基準圖、各段落
 *   Timeline()           上排分段 / 下排 keyframe 位置 / cross fade
 *   MediaGrid / MediaCard 縮圖格與縮圖卡（含 A、B 比較按鈕）
 *   ComparePanel()       A/B 比較（並排、滑桿、疊化）
 *   SpendingPanel()      點數統計
 *   Lightbox             點縮圖放大看，左右鍵切換
 * ===================================================================== */

const ASSET_ROOT = "assets/data"; // 素材根目錄（相對於 index.html）

/* ---- 全域狀態 ---- */
const state = {
  scene: SCENES[0].id,          // 目前場景分頁（或 "spending"）
  view: "storyboard",           // 子分頁："storyboard" | "compare"（各場景共用，和原站一樣）
  compare: { A: null, B: null },// 比較用的兩個素材
  cmpMode: "wipe",              // 比較模式："side" | "wipe" | "fade"
  cmpValue: 50,                 // 滑桿 0–100
};

/* ---- 工具函式 ---- */
const SCENE_LABEL = Object.fromEntries(SCENES.map((s) => [s.id, `${s.id} ${s.title}`]));
const KIND_LABEL = { image: "圖片", video: "影片" };
const fmtNum = (n) => n.toLocaleString("en-US");

/** "mm:ss" → 秒 */
function toSeconds(t) {
  const [m, s] = t.trim().split(":").map(Number);
  return m * 60 + s;
}
/** 段落 time "mm:ss–mm:ss" → [起, 迄] 秒 */
function sectionRange(section) {
  return section.time.split(/[–-]/).map(toSeconds);
}
/** 秒 → "m:ss" */
function fmtTime(sec) {
  const t = Math.max(0, Math.floor(sec));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/** 場景內的相對路徑 → 素材物件 { path, url, kind, name } */
function media(scene, rel) {
  const path = `${scene.dir}/${rel}`;
  const name = rel.split("/").pop();
  return { path, url: `${ASSET_ROOT}/${path}`, kind: name.endsWith(".mp4") ? "video" : "image", name };
}
const mediaList = (scene, rels) => (rels || []).map((r) => media(scene, r));

/* =====================================================================
 * 主畫面
 * ===================================================================== */
const root = document.getElementById("root");

function renderApp() {
  const sceneItems = SCENES.map((s) => ({ value: s.id, label: `${s.id} ${s.title}` }));
  if (SPENDING) sceneItems.push({ value: "spending", label: "點數" });

  const tabs = Tabs({ items: sceneItems, active: state.scene, onChange: (v) => { state.scene = v; resetCompareUi(); renderApp(); } });
  const scene = SCENES.find((s) => s.id === state.scene);
  tabs.root.append(scene ? ScenePanel(scene) : TabPanel("pt-4", SpendingPanel()));

  root.replaceChildren(
    h("div", { class: "mx-auto max-w-[1600px] space-y-4 p-4 md:p-6" },
      h("header", { class: "flex flex-wrap items-baseline gap-x-4 gap-y-1" },
        h("h1", { class: "text-lg font-semibold" }, SITE.title),
        h("p", { class: "text-sm text-muted-foreground" }, SITE.subtitle)),
      tabs.root));
}

/* 原站的比較模式／滑桿是元件內狀態，切換分頁就會重置 */
function resetCompareUi() {
  state.cmpMode = "wipe";
  state.cmpValue = 50;
}

/* ---- 場景分頁 ---- */
function ScenePanel(scene) {
  const tabs = Tabs({
    variant: "line",
    items: [
      { value: "storyboard", label: "分鏡" },
      { value: "compare", label: compareTabLabel() },
    ],
    active: state.view,
    onChange: (v) => { state.view = v; resetCompareUi(); renderApp(); },
  });
  tabs.root.append(TabPanel("pt-4", state.view === "storyboard" ? Storyboard(scene) : ComparePanel()));

  return TabPanel("space-y-4 pt-2",
    h("p", { class: "text-sm text-muted-foreground" }, `${scene.length} · ${scene.period} · data/${scene.dir}/`),
    tabs.root);
}

/** 「比較」分頁標籤，有選素材時顯示 n/2 */
function compareTabLabel() {
  const n = [state.compare.A, state.compare.B].filter(Boolean).length;
  return ["比較", n > 0 ? Badge("secondary", `${n}/2`) : null];
}

/** 設定比較 A／B；在分鏡頁只更新標記，不重畫（避免預覽影片被重置） */
function setCompare(slot, m) {
  state.compare = { ...state.compare, [slot]: m };
  document.querySelectorAll("figure[data-path]").forEach((fig) => {
    const s = slotOf(fig.dataset.path);
    fig.className = s ? CLS.figureSelected : CLS.figure;
    fig.querySelectorAll("button[data-slot-btn]").forEach((b) => {
      b.className = b.dataset.slotBtn === s ? CLS.slotBtnSelected : CLS.slotBtn;
    });
  });
  const tab = document.querySelector('[role=tab][data-value="compare"]');
  if (tab) tab.replaceChildren(...compareTabLabel().filter(Boolean));
}
const slotOf = (path) => (state.compare.A?.path === path ? "A" : state.compare.B?.path === path ? "B" : undefined);

/* =====================================================================
 * 分鏡
 * ===================================================================== */
function Storyboard(scene) {
  // 基準圖 + 各段 keyframe 串成一個序列，燈箱可以一路左右切換
  const baseItems = mediaList(scene, [...(scene.base ? [scene.base] : []), ...(scene.candidates || [])]);
  const kfGroups = [baseItems, ...scene.sections.map((s) => mediaList(scene, s.keyframes))];
  const kfAll = kfGroups.flat();
  const kfOffset = kfGroups.map((_, i) => kfGroups.slice(0, i).reduce((n, g) => n + g.length, 0));
  // 片段影片另成一個序列
  const clipGroups = scene.sections.map((s) => mediaList(scene, s.clips));
  const clipAll = clipGroups.flat();
  const clipOffset = clipGroups.map((_, i) => clipGroups.slice(0, i).reduce((n, g) => n + g.length, 0));

  const preview = scene.preview ? media(scene, scene.preview) : null;
  let video = null;
  const seek = (t) => { if (video) { video.currentTime = t; timeline.update(t); } };

  const timeline = Timeline(scene, {
    onSeek: preview ? seek : null,
    onSelectSection: (sec) => {
      if (preview) seek(sectionRange(sec)[0]);
      document.getElementById(`section-${scene.id}-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  });
  if (preview) {
    video = h("video", {
      src: preview.url, controls: true, preload: "metadata", class: "w-full max-w-4xl rounded-lg bg-black",
      ontimeupdate: (e) => timeline.update(e.currentTarget.currentTime),
      onseeked: (e) => timeline.update(e.currentTarget.currentTime),
    });
  }

  return h("div", { class: "space-y-6" },
    h("section", { class: "space-y-3" }, video, timeline.el),

    // 基準圖
    baseItems.length > 0 && h("section", { class: "space-y-2" },
      h("h3", { class: "font-medium" }, "基準圖", " ", scene.base ? Badge("default", "已選") : Badge("secondary", "候選，待選")),
      MediaGrid(baseItems, kfAll, 0)),

    // 各段落
    scene.sections.map((sec, i) => {
      const kfs = kfGroups[i + 1];
      const clips = clipGroups[i];
      return h("section", { id: `section-${scene.id}-${sec.id}`, class: "grid scroll-mt-4 gap-3 border-t pt-4 md:grid-cols-[220px_1fr]" },
        h("div", { class: "space-y-1.5" },
          h("h3", { class: "font-mono font-semibold" }, sec.id),
          h("p", { class: "text-xs tabular-nums text-muted-foreground" }, sec.time),
          h("p", { class: "text-sm" }, sec.idea),
          h("p", { class: "text-xs" }, h("span", { class: "text-muted-foreground" }, "作法　"), sec.method ?? "還沒有片段，只有 keyframe"),
          sec.fades && h("p", { class: "text-xs tabular-nums" },
            h("span", { class: "text-muted-foreground" }, "cross fade　"),
            sec.fades.map((f, j) => (sec.at?.[j] === null ? "—" : `${f}s`)).join(" → ")),
          sec.note && h("p", { class: "text-xs text-muted-foreground" }, sec.note),
          SectionEffects(scene, sec)),
        h("div", { class: "space-y-3" },
          kfs.length > 0 ? MediaGrid(kfs, kfAll, kfOffset[i + 1]) : h("p", { class: "text-sm text-muted-foreground" }, "還沒有 keyframe"),
          clips.length > 0 && h("div", { class: "space-y-1" },
            h("p", { class: "text-xs text-muted-foreground" }, "片段"),
            MediaGrid(clips, clipAll, clipOffset[i]))));
    }));
}

/* ---- 時間軸 ---- */
/* ---- 特效（content.js 的 scene.effects） ---- */
const EFFECT_KINDS = { // 顯示順序與名稱
  state: "畫面",
  constant: "常駐",
  drum: "鼓點",
  vfx: "VFX",
};

/** 時間軸下方的特效列：同類型放一起，時間重疊時自動往下排一列 */
function EffectRows(scene, pct, onSeek) {
  const effects = scene.effects || [];
  if (effects.length === 0) return null;
  const rows = [];
  for (const kind of ["state", "constant", "drum", "vfx"]) {
    const lanes = [];
    effects.filter((e) => e.kind === kind)
      .map((e) => ({ ...e, a: toSeconds(e.start), b: toSeconds(e.end) }))
      .sort((x, y) => x.a - y.a)
      .forEach((e) => {
        let lane = lanes.find((l) => l.end <= e.a);
        if (!lane) lanes.push((lane = { end: 0, items: [] }));
        lane.items.push(e);
        lane.end = e.b;
      });
    // 畫面狀態說明和常駐效果時間不重疊時共用一列
    if (kind === "constant" && rows.length && lanes.length) {
      const prev = rows[rows.length - 1];
      if (prev.kind === "state" && lanes[0].items.every((e) => prev.items.every((p) => p.b <= e.a || p.a >= e.b))) {
        prev.items.push(...lanes.shift().items);
      }
    }
    lanes.forEach((l) => rows.push({ kind, items: l.items }));
  }
  const el = h("div", { class: "effect-rows" }, rows.map((row) =>
    h("div", { class: "effect-row" }, row.items.map((e) => h("div", {
      class: cx("effect-band", `effect-${e.kind}`, onSeek && "is-seekable"),
      style: { left: pct(e.a), width: pct(e.b - e.a) },
      title: `${EFFECT_KINDS[e.kind] || e.kind}｜${e.label}\n${e.start}–${e.end}`,
      onclick: onSeek ? () => onSeek(e.a) : null,
    }, h("span", { class: "effect-text" },
      e.kind === "vfx" || e.kind === "drum" ? h("b", {}, "VFX ") : null,
      e.kind === "constant" ? h("b", {}, "常駐 ") : null,
      e.label))))));

  // 文字放不下時換到第二行：量每一列最高的標籤，把該列撐高（視窗寬度改變時重算）
  const fit = () => {
    for (const row of el.children) {
      row.classList.add("is-measuring");
      const tallest = Math.max(...[...row.children].map((b) => b.offsetHeight));
      row.classList.remove("is-measuring");
      row.style.height = `${tallest}px`;
    }
  };
  new ResizeObserver(fit).observe(el);
  return el;
}

/** 和段落時間重疊的特效，列在段落左欄 */
function SectionEffects(scene, sec) {
  const [a, b] = sectionRange(sec);
  const list = (scene.effects || []).filter((e) => toSeconds(e.start) < b && toSeconds(e.end) > a);
  if (list.length === 0) return null;
  return h("ul", { class: "section-effects text-xs" }, list.map((e) =>
    h("li", { class: `effect-${e.kind}` },
      h("span", { class: "effect-dot" }),
      h("span", { class: "text-muted-foreground" }, `${EFFECT_KINDS[e.kind] || e.kind}　`),
      e.label, h("span", { class: "text-muted-foreground tabular-nums" }, `　${e.start}–${e.end}`))));
}

function Timeline(scene, { onSeek, onSelectSection }) {
  const total = toSeconds(scene.length);
  const pct = (s) => `${(s / total) * 100}%`;

  // keyframe 在時間軸上的位置：有 at 用 at，否則平均分佈在段落內；at 為 null 的略過
  const slots = [];
  for (const sec of scene.sections) {
    const [start, end] = sectionRange(sec);
    sec.keyframes.forEach((rel, i) => {
      const t = sec.at ? sec.at[i] : start + ((end - start) * i) / sec.keyframes.length;
      if (t != null) slots.push({ section: sec, index: i, start: t, fade: sec.fades?.[i] ?? 0, media: media(scene, rel) });
    });
  }
  slots.sort((a, b) => a.start - b.start);
  slots.forEach((s, i) => { s.end = slots[i + 1]?.start ?? total; });
  const faded = slots.filter((s) => s.fade > 0);

  // 刻度：每 30 秒一條線，整分鐘標字
  const ticks = Array.from({ length: Math.floor(total / 30) + 1 }, (_, i) => i * 30);

  const SEC_BTN = "absolute inset-y-0 overflow-hidden border-r border-background px-1 text-left font-mono text-xs leading-8 whitespace-nowrap";
  const secButtons = scene.sections.map((sec, i) => {
    const [a, b] = sectionRange(sec);
    const btn = h("button", {
      type: "button", title: `${sec.id} ${sec.time}\n${sec.idea}`, class: cx(SEC_BTN, i % 2 ? "bg-muted" : "bg-muted/60"),
      style: { left: pct(a), width: pct(b - a) }, onclick: () => onSelectSection(sec),
    }, sec.id);
    btn._range = [a, b];
    btn._idle = i % 2 ? "bg-muted" : "bg-muted/60";
    return btn;
  });

  const lane = h("div", {
    class: cx("relative mt-1 h-14", onSeek && "cursor-pointer"),
    onclick: (e) => {
      if (!onSeek) return;
      const r = e.currentTarget.getBoundingClientRect();
      onSeek(((e.clientX - r.left) / r.width) * total);
    },
  },
  slots.map((s) => h("div", {
    class: "absolute inset-y-0 overflow-hidden border-r border-background bg-muted bg-cover bg-center",
    style: { left: pct(s.start), width: pct(s.end - s.start), backgroundImage: `url("${s.media.url}")` },
    title: `${s.section.id} · ${s.media.name}\n${fmtTime(s.start)} 起${s.fade ? `，cross fade ${s.fade} 秒` : ""}`,
  })),
  faded.map((s) => h("div", {
    class: "pointer-events-none absolute inset-y-0 bg-gradient-to-r from-transparent via-white/50 to-transparent",
    style: { left: pct(s.start), width: pct(s.fade) },
  })));

  // 實拍鼓點：時間軸最上方的粉紫色橫條（content.js 的 scene.drums）
  const drums = (scene.drums || []).map((d) => {
    const [a, b] = [toSeconds(d.start), toSeconds(d.end)];
    const label = d.label || "實拍鼓點";
    return h("div", {
      class: cx("drum-band", onSeek && "is-seekable"),
      style: { left: pct(a), width: pct(b - a) },
      title: `${label} ${d.start}–${d.end}`,
      onclick: onSeek ? () => onSeek(a) : null,
    }, h("span", { class: "drum-band-label" }, label), h("span", { class: "drum-band-time" }, `${d.start}–${d.end}`));
  });

  const body = h("div", { class: "relative" },
    drums.length > 0 && h("div", { class: "drum-row" }, drums),
    h("div", { class: "relative h-8" }, secButtons),
    lane,
    h("div", { class: "relative h-4 text-[10px] tabular-nums text-muted-foreground" },
      faded.map((s) => h("span", { class: "absolute -translate-x-1/2 whitespace-nowrap", style: { left: pct(s.start + s.fade / 2) } }, s.fade, "s"))),
    EffectRows(scene, pct, onSeek));

  const el = h("div", { class: "space-y-1 select-none" },
    h("div", { class: "relative h-4 text-[10px] tabular-nums text-muted-foreground" },
      ticks.map((t) => h("span", { class: "absolute top-0 h-full border-l border-foreground/20 pl-0.5", style: { left: pct(t) } }, t % 60 === 0 ? fmtTime(t) : ""))),
    body,
    h("p", { class: "text-xs text-muted-foreground" },
      scene.drums?.length ? "粉紫色橫條是實拍鼓點區間。" : "",
      scene.effects?.length ? "最下方是特效：藍＝常駐、橘＝VFX、紫＝和鼓點綁定的 VFX、灰字＝畫面狀態。" : "",
      "上排是分段，下排是各 keyframe 的狀態位置；白色漸層是 cross fade，下方數字是秒數。",
      onSeek ? "點下排可以跳到預覽的該時間。" : "還沒有預覽影片，keyframe 先平均排在各段裡。"));

  // 播放時更新：紅色播放線 + 目前段落高亮
  let playhead = null;
  function update(time) {
    if (!playhead) {
      playhead = h("div", { class: "pointer-events-none absolute inset-y-0 w-0.5 bg-red-500" });
      body.append(playhead);
    }
    playhead.style.left = pct(time);
    for (const btn of secButtons) {
      const on = time >= btn._range[0] && time < btn._range[1];
      btn.className = cx(SEC_BTN, on ? "bg-primary text-primary-foreground" : btn._idle);
    }
  }
  return { el, update };
}

/* ---- 縮圖格與縮圖卡 ---- */
function MediaGrid(items, sequence, offset) {
  return h("div", { class: "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3" },
    items.map((m, i) => MediaCard(m, () => Lightbox.open(sequence, offset + i))));
}

function MediaCard(m, onOpen) {
  const slot = slotOf(m.path);
  const thumb = m.kind === "video"
    ? h("video", {
      src: m.url, muted: true, loop: true, playsinline: true, preload: "metadata", class: "size-full object-cover",
      onmouseenter: (e) => e.currentTarget.play(), onmouseleave: (e) => e.currentTarget.pause(),
    })
    : h("img", { src: m.url, alt: m.name, loading: "lazy", class: "size-full object-cover" });

  return h("figure", { class: slot ? CLS.figureSelected : CLS.figure, "data-path": m.path },
    h("button", { type: "button", class: "block aspect-video w-full cursor-zoom-in", onclick: onOpen }, thumb),
    h("figcaption", { class: "flex items-center gap-1 px-2 py-1 text-xs" },
      h("span", { class: "min-w-0 flex-1 truncate", title: m.path }, m.name),
      ["A", "B"].map((s) => h("button", {
        type: "button", title: `設為比較 ${s}`, "data-slot-btn": s,
        class: slot === s ? CLS.slotBtnSelected : CLS.slotBtn, onclick: () => setCompare(s, m),
      }, s))));
}

/* =====================================================================
 * 比較
 * ===================================================================== */
function CompareMedia(m, style) {
  const cls = "absolute inset-0 size-full object-contain";
  return m.kind === "video"
    ? h("video", { src: m.url, muted: true, loop: true, autoplay: true, playsinline: true, class: cls, style })
    : h("img", { src: m.url, alt: m.name, class: cls, style });
}

function ComparePanel() {
  const { A, B } = state.compare;
  if (!A || !B) {
    return h("p", { class: "rounded-lg border border-dashed p-8 text-center text-muted-foreground" },
      "在縮圖下方按 A、B 各選一張，就能在這裡比較。目前：A", " ", A ? A.name : "未選", "，B ", B ? B.name : "未選");
  }
  const mode = state.cmpMode;
  const rerender = () => renderApp();

  // 模式切換（並排／滑桿／疊化）
  const toggle = h("div", { "data-orientation": "horizontal", role: "group", "data-slot": "toggle-group", "data-variant": "outline", "data-spacing": "2", class: CLS.toggleGroup, style: { "--gap": "2" } },
    [["side", "並排"], ["wipe", "滑桿"], ["fade", "疊化"]].map(([v, label]) => h("button", {
      type: "button", "aria-pressed": String(mode === v), "data-pressed": mode === v,
      "data-slot": "toggle-group-item", "data-variant": "outline", "data-size": "default", "data-spacing": "2",
      class: CLS.toggleItem, onclick: () => { state.cmpMode = v; rerender(); },
    }, label)));

  // 疊在上面的 B 圖：滑桿＝左右裁切，疊化＝透明度
  const layerStyle = (v) => (mode === "wipe" ? { clipPath: `inset(0 0 0 ${100 - v}%)` } : { opacity: String(v / 100) });
  let layerB = null;
  let divider = null;

  // 滑桿：外觀照原站，操作交給覆蓋在上面的透明 <input type=range>
  let slider = null;
  if (mode !== "side") {
    const range = h("div", { "data-orientation": "horizontal", "data-slot": "slider-range", class: CLS.sliderRange, style: { position: "relative", height: "inherit", width: `${state.cmpValue}%` } });
    const thumb = h("div", { "data-orientation": "horizontal", "data-slot": "slider-thumb", class: CLS.sliderThumb, style: { position: "absolute", left: `${state.cmpValue}%`, top: "50%", translate: "-50% -50%" } });
    const input = h("input", {
      type: "range", min: "0", max: "100", step: "1", value: String(state.cmpValue), "aria-label": "A／B 比例",
      class: "slider-input",
      oninput: (e) => {
        const v = Number(e.currentTarget.value);
        state.cmpValue = v;
        range.style.width = `${v}%`;
        thumb.style.left = `${v}%`;
        Object.assign(layerB.style, layerStyle(v));
        if (divider) divider.style.left = `${100 - v}%`;
      },
    });
    slider = h("div", { class: "flex w-72 items-center gap-2 text-xs text-muted-foreground" },
      h("span", {}, "A"),
      h("div", { "data-orientation": "horizontal", role: "group", "data-slot": "slider", class: CLS.slider },
        h("div", { "data-orientation": "horizontal", class: CLS.sliderControl },
          h("div", { "data-orientation": "horizontal", "data-slot": "slider-track", class: CLS.sliderTrack, style: { position: "relative" } }, range),
          thumb, input)),
      h("span", {}, "B"));
  }

  let stage;
  if (mode === "side") {
    stage = h("div", { class: "grid grid-cols-2 gap-2" },
      [A, B].map((m) => h("div", { class: "relative aspect-video overflow-hidden rounded-lg bg-black" }, CompareMedia(m))));
  } else {
    layerB = CompareMedia(B, layerStyle(state.cmpValue));
    if (mode === "wipe") divider = h("div", { class: "pointer-events-none absolute inset-y-0 w-px bg-white/80", style: { left: `${100 - state.cmpValue}%` } });
    stage = h("div", { class: "relative mx-auto aspect-video max-w-[calc(78vh*16/9)] overflow-hidden rounded-lg bg-black" },
      CompareMedia(A), layerB, divider);
  }

  return h("div", { class: "space-y-3" },
    h("div", { class: "flex flex-wrap items-center gap-3" },
      toggle, slider,
      h("button", { type: "button", "data-slot": "button", class: CLS.btnOutlineSm, onclick: () => { state.compare = { A: B, B: A }; rerender(); } }, Icons.arrowLeftRight(), " 對調"),
      h("button", { type: "button", "data-slot": "button", class: CLS.btnGhostSm, onclick: () => { state.compare = { A: null, B: null }; rerender(); } }, Icons.x(), " 清除")),
    h("div", { class: "grid grid-cols-2 gap-2 text-xs text-muted-foreground" },
      h("span", { class: "truncate" }, "A：", A.path),
      h("span", { class: "truncate" }, "B：", B.path)),
    stage);
}

/* =====================================================================
 * 點數
 * ===================================================================== */
/** 依 keyFn 分組加總（保留第一次出現的順序） */
function groupSum(entries, keyFn) {
  const map = new Map();
  for (const e of entries) {
    const key = keyFn(e);
    const g = map.get(key) ?? { key, points: 0, count: 0 };
    g.points += e.points;
    g.count += e.count;
    map.set(key, g);
  }
  return [...map.values()];
}

function StatCard(label, value) {
  return h("div", { class: "rounded-lg border p-3" },
    h("p", { class: "text-xs text-muted-foreground" }, label),
    h("p", { class: "text-xl font-semibold tabular-nums" }, value));
}

function ShareTable(title, rows, total, unit = "張／支") {
  return h("section", { class: "space-y-2" },
    h("h3", { class: "font-medium" }, title),
    h("table", { class: "w-full text-sm" },
      h("thead", { class: "text-left text-muted-foreground" },
        h("tr", { class: "border-b" },
          h("th", { class: "py-1.5 font-normal" }, "項目"),
          h("th", { class: "py-1.5 text-right font-normal" }, unit),
          h("th", { class: "py-1.5 text-right font-normal" }, "點數"),
          h("th", { class: "w-2/5 py-1.5 pl-3 font-normal" }, "比例"))),
      h("tbody", {}, rows.map((r) => {
        const ratio = total > 0 ? r.points / total : 0;
        return h("tr", { class: "border-b last:border-0" },
          h("td", { class: "py-1.5" }, r.key),
          h("td", { class: "py-1.5 text-right tabular-nums" }, r.count),
          h("td", { class: "py-1.5 text-right tabular-nums" }, fmtNum(r.points)),
          h("td", { class: "py-1.5 pl-3" },
            h("div", { class: "flex items-center gap-2" },
              h("div", { class: "h-2 flex-1 rounded-full bg-muted" },
                h("div", { class: "h-2 rounded-full bg-primary", style: { width: `${ratio * 100}%` } })),
              h("span", { class: "w-10 text-right text-xs tabular-nums text-muted-foreground" }, Math.round(ratio * 100), "%"))));
      }))));
}

function SceneModelTable(entries) {
  const models = [...new Set(entries.map((e) => e.model))];
  const sceneIds = SCENES.map((s) => s.id).filter((id) => entries.some((e) => e.scene === id));
  const sum = (sid, model) => entries.filter((e) => e.scene === sid && e.model === model).reduce((n, e) => n + e.points, 0);
  return h("section", { class: "space-y-2" },
    h("h3", { class: "font-medium" }, "場景 × 模型"),
    h("div", { class: "overflow-x-auto" },
      h("table", { class: "w-full text-sm" },
        h("thead", { class: "text-muted-foreground" },
          h("tr", { class: "border-b" },
            h("th", { class: "py-1.5 text-left font-normal" }, "場景"),
            models.map((m) => h("th", { class: "py-1.5 text-right font-normal" }, m)),
            h("th", { class: "py-1.5 text-right font-normal" }, "合計"))),
        h("tbody", {}, sceneIds.map((sid) => h("tr", { class: "border-b last:border-0" },
          h("td", { class: "py-1.5" }, SCENE_LABEL[sid] ?? sid),
          models.map((m) => { const v = sum(sid, m); return h("td", { class: "py-1.5 text-right tabular-nums" }, v > 0 ? fmtNum(v) : "—"); }),
          h("td", { class: "py-1.5 text-right font-medium tabular-nums" }, fmtNum(models.reduce((n, m) => n + sum(sid, m), 0)))))))));
}

function SpendingPanel() {
  const entries = SPENDING.entries;
  const total = entries.reduce((n, e) => n + e.points, 0);
  const images = entries.filter((e) => e.kind === "image").reduce((n, e) => n + e.count, 0);
  const videos = entries.filter((e) => e.kind === "video").reduce((n, e) => n + e.count, 0);
  const sorted = [...entries].sort((a, b) =>
    b.date.localeCompare(a.date) || a.scene.localeCompare(b.scene) || a.round.localeCompare(b.round));
  const TH = "py-1.5 pr-3 font-normal";

  return h("div", { class: "space-y-8" },
    h("p", { class: "text-sm text-muted-foreground" }, SPENDING.intro),
    h("div", { class: "grid grid-cols-2 gap-3 md:grid-cols-4" },
      StatCard("點數合計", fmtNum(total)),
      StatCard("圖片", `${images} 張`),
      StatCard("影片", `${videos} 支`),
      StatCard("紀錄筆數", `${entries.length}`)),
    h("div", { class: "grid gap-8 lg:grid-cols-2" },
      ShareTable("依場景", groupSum(entries, (e) => SCENE_LABEL[e.scene] ?? e.scene), total),
      ShareTable("依模型", groupSum(entries, (e) => e.model).sort((a, b) => b.points - a.points), total),
      ShareTable("依類型", groupSum(entries, (e) => KIND_LABEL[e.kind]), total),
      ShareTable("依帳號", groupSum(entries, (e) => e.account), total)),
    SceneModelTable(entries),
    h("section", { class: "space-y-2" },
      h("h3", { class: "font-medium" }, "明細"),
      h("div", { class: "overflow-x-auto" },
        h("table", { class: "w-full text-sm" },
          h("thead", { class: "text-left text-muted-foreground" },
            h("tr", { class: "border-b" },
              h("th", { class: TH }, "日期"), h("th", { class: TH }, "場景"), h("th", { class: TH }, "輪次"),
              h("th", { class: TH }, "模型"), h("th", { class: TH }, "類型"),
              h("th", { class: "py-1.5 pr-3 text-right font-normal" }, "數量"),
              h("th", { class: "py-1.5 pr-3 text-right font-normal" }, "點數"),
              h("th", { class: TH }, "帳號"), h("th", { class: "py-1.5 font-normal" }, "內容"))),
          h("tbody", {}, sorted.map((e) => h("tr", { class: "border-b last:border-0" },
            h("td", { class: "py-1.5 pr-3 tabular-nums" }, e.date),
            h("td", { class: "py-1.5 pr-3 whitespace-nowrap" }, SCENE_LABEL[e.scene] ?? e.scene),
            h("td", { class: "py-1.5 pr-3 font-mono text-xs" }, e.round),
            h("td", { class: "py-1.5 pr-3 whitespace-nowrap" }, e.model),
            h("td", { class: "py-1.5 pr-3" }, KIND_LABEL[e.kind]),
            h("td", { class: "py-1.5 pr-3 text-right tabular-nums" }, e.count),
            h("td", { class: "py-1.5 pr-3 text-right tabular-nums" }, fmtNum(e.points)),
            h("td", { class: "py-1.5 pr-3 text-xs text-muted-foreground" }, e.account),
            h("td", { class: "py-1.5 text-muted-foreground" }, e.note))))))));
}

/* =====================================================================
 * 燈箱（點縮圖放大；← → 切換、Esc 或點背景關閉）
 * ===================================================================== */
const Lightbox = (() => {
  let items = null;
  let index = 0;
  let layer = null;

  function onKey(e) {
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Escape") close();
  }
  function step(d) {
    index = (index + d + items.length) % items.length;
    draw();
  }
  function open(list, i) {
    items = list;
    index = i;
    document.documentElement.style.scrollbarGutter = "stable"; // 鎖捲動時避免版面跳動
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    draw();
  }
  function close() {
    window.removeEventListener("keydown", onKey);
    layer?.remove();
    layer = null;
    document.body.style.overflow = "";
    document.documentElement.style.scrollbarGutter = "";
  }
  function draw() {
    const m = items[index];
    const viewer = m.kind === "video"
      ? h("video", { src: m.url, controls: true, autoplay: true, loop: true, class: "max-h-[82vh] w-auto" })
      : h("img", { src: m.url, alt: m.name, class: "max-h-[82vh] w-auto" });
    const content = h("div", { "data-open": true, role: "dialog", "aria-modal": "true", tabindex: "-1", "data-slot": "dialog-content", class: CLS.dialogContent },
      h("div", { class: "relative flex items-center justify-center" },
        viewer,
        items.length > 1 && [
          h("button", { type: "button", "data-slot": "button", class: `${CLS.btnSecondaryIcon} absolute left-2 opacity-70`, onclick: () => step(-1) }, Icons.chevronLeft()),
          h("button", { type: "button", "data-slot": "button", class: `${CLS.btnSecondaryIcon} absolute right-2 opacity-70`, onclick: () => step(1) }, Icons.chevronRight()),
        ]),
      h("div", { class: "flex items-baseline gap-3 px-1 text-white/80" },
        h("h2", { "data-slot": "dialog-title", class: "font-heading font-medium text-sm text-white" }, m.name),
        h("p", { "data-slot": "dialog-description", class: "*:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground text-xs text-white/60" }, m.path),
        h("span", { class: "ml-auto text-xs tabular-nums text-white/60" }, index + 1, " / ", items.length)),
      h("button", { type: "button", "data-slot": "dialog-close", class: CLS.dialogClose, onclick: close }, Icons.x(), h("span", { class: "sr-only" }, "Close")));

    const isNew = !layer;
    const next = h("div", { "data-slot": "dialog-portal" },
      h("div", { "data-open": true, "data-slot": "dialog-overlay", class: CLS.dialogOverlay, onclick: close }),
      content);
    // 切換圖片時不重播淡入動畫
    if (!isNew) {
      next.firstChild.removeAttribute("data-open");
      content.removeAttribute("data-open");
      layer.replaceWith(next);
    } else {
      document.body.append(next);
    }
    layer = next;
    content.focus({ preventScroll: true });
  }
  return { open, close };
})();

/* ---- 啟動 ---- */
renderApp();
