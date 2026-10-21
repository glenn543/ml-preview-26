/* =====================================================================
 * 共用 UI 小工具：建立元素的 h()、圖示、以及從原站複製來的元件 class。
 *
 * 原站是 React + shadcn/ui（base-ui）+ Tailwind CSS v4。這裡不用框架，
 * 改成直接產生「和原站一樣 class 的 HTML」，樣式全部由 css/app.css
 * （原站編譯好的 Tailwind CSS）提供。
 * 注意：app.css 只含原站用到的 Tailwind class，新加沒用過的 class 不會生效，
 *       這種情況請把樣式寫在 css/custom.css。
 * ===================================================================== */

/**
 * 建立 DOM 元素。
 *   h("div", { class: "p-4", onclick: fn, style: { left: "10%" } }, "文字", 子元素…)
 * 屬性值為 null / undefined / false 時略過；子元素可以是字串、元素或陣列。
 */
function h(tag, props, ...children) {
  const el = tag === "svg" || tag === "path"
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2), value);
    } else if (key === "style" && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (v == null) continue;
        if (k.startsWith("--")) el.style.setProperty(k, v);
        else el.style[k] = v;
      }
    } else if (key === "class") {
      el.setAttribute("class", value);
    } else if (value === true) {
      el.setAttribute(key, "");
      if (typeof el[key] === "boolean") el[key] = true; // 例如 video.muted 要設屬性才會真的靜音
    } else if (key in el && typeof el[key] !== "object" && !(el instanceof SVGElement)) {
      el[key] = value; // 例如 muted、loop、controls、value
    } else {
      el.setAttribute(key, value);
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false || child === "") continue;
    el.append(child instanceof Node ? child : String(child));
  }
}

/** 合併 class 字串（略過空值） */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/* ---- lucide 圖示（原站用的 4 個） ---- */
function icon(name, paths) {
  return () =>
    h("svg", {
      width: "24", height: "24", viewBox: "0 0 24 24",
      fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round",
      "stroke-linejoin": "round", class: `lucide lucide-${name}`, "aria-hidden": "true",
    }, paths.map((d) => h("path", { d })));
}
const Icons = {
  chevronLeft: icon("chevron-left", ["m15 18-6-6 6-6"]),
  chevronRight: icon("chevron-right", ["m9 18 6-6-6-6"]),
  x: icon("x", ["M18 6 6 18", "m6 6 12 12"]),
  arrowLeftRight: icon("arrow-left-right", ["M8 3 4 7l4 4", "M4 7h16", "m16 21 4-4-4-4", "M20 17H4"]),
};

/* ---- 元件 class（直接取自原站渲染結果，勿隨意改動） ---- */
const BTN_BASE = "group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0";
const BTN_SM = "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5";

const CLS = {
  tabs: "group/tabs flex gap-2 data-horizontal:flex-col",
  tabsListBase: "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  tabsListVariant: { default: "bg-muted", line: "gap-1 bg-transparent" },
  tabTrigger: "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
  tabPanel: "flex-1 text-sm outline-none",

  badgeBase: "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  badgeVariant: {
    default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
  },

  btnOutlineSm: `${BTN_BASE} border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 ${BTN_SM}`,
  btnGhostSm: `${BTN_BASE} border-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 ${BTN_SM}`,
  btnSecondaryIcon: "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground size-8",
  dialogClose: "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg absolute top-2 right-2",
  dialogOverlay: "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
  dialogContent: "fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 rounded-xl text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 max-w-[95vw] gap-2 bg-black p-2 sm:max-w-[95vw]",

  toggleGroup: "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",
  toggleItem: "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border border-input bg-transparent hover:bg-muted h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",

  slider: "data-horizontal:w-full data-vertical:h-full",
  sliderControl: "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
  sliderTrack: "relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
  sliderRange: "bg-primary select-none data-horizontal:h-full data-vertical:w-full",
  sliderThumb: "relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50",

  /* 縮圖卡片 */
  figure: "group relative overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10",
  figureSelected: "group relative overflow-hidden rounded-lg bg-muted ring-2 ring-primary",
  slotBtn: "rounded px-1.5 font-mono text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  slotBtnSelected: "rounded px-1.5 font-mono hover:bg-accent hover:text-accent-foreground bg-primary text-primary-foreground",
};

/* ---- 小元件 ---- */
function Badge(variant, ...children) {
  return h("span", { "data-slot": "badge", "data-variant": variant, class: cx(CLS.badgeBase, CLS.badgeVariant[variant]) }, children);
}

/**
 * 分頁元件（對應 shadcn Tabs）。
 *   items: [{ value, label }]，label 可以是字串或元素陣列
 *   active: 目前選中的 value；onChange(value)
 *   variant: "default"（灰底膠囊）或 "line"（底線）
 *   回傳 { root, list }，分頁內容請自行 append 到 root
 */
function Tabs({ items, active, onChange, variant = "default" }) {
  const list = h("div", {
    "data-orientation": "horizontal", role: "tablist", "data-slot": "tabs-list", "data-variant": variant,
    class: cx(CLS.tabsListBase, CLS.tabsListVariant[variant]),
  }, items.map((it) =>
    h("button", {
      type: "button", role: "tab", "data-slot": "tabs-trigger", "data-orientation": "horizontal",
      "data-value": it.value, "aria-selected": String(it.value === active),
      "data-active": it.value === active, tabindex: it.value === active ? "0" : "-1",
      class: CLS.tabTrigger, onclick: () => onChange(it.value),
    }, it.label)));
  // 左右鍵切換（原站 base-ui 的行為）
  list.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.stopPropagation();
    const i = items.findIndex((it) => it.value === active);
    const next = items[(i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length];
    onChange(next.value);
    requestAnimationFrame(() => document.querySelector(`[role=tab][data-value="${CSS.escape(next.value)}"]`)?.focus());
  });
  const root = h("div", { "data-orientation": "horizontal", "data-slot": "tabs", class: CLS.tabs }, list);
  return { root, list };
}

function TabPanel(extraClass, ...children) {
  return h("div", { role: "tabpanel", "data-slot": "tabs-content", "data-orientation": "horizontal", tabindex: "0", class: cx(CLS.tabPanel, extraClass) }, children);
}
