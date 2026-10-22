/* =====================================================================
 * 內容設定檔 —— 要改文字、增刪段落或圖片，只需要改這個檔案。
 *
 * 素材路徑規則：
 *   每個場景有 dir（例如 "01-reflection"），段落裡的 keyframes / clips
 *   寫的是「相對於該場景資料夾」的路徑，實際檔案放在：
 *     assets/data/<dir>/<路徑>
 *   例：dir "02-grassland" + "r8/clips/g1-overcast-dawn-JWV0B3.mp4"
 *     → assets/data/02-grassland/r8/clips/g1-overcast-dawn-JWV0B3.mp4
 *   副檔名是 .mp4 會當影片顯示，其餘當圖片。
 * ===================================================================== */

/* 頁首 */
window.SITE = {
  title: "叁式",
  subtitle: "分享版，2026-10-15 的進度",
};

/* 草原多數段落共用的「作法」說明 */
const SEA_METHOD =
  "LTX 2.5 720P 15 秒，r12 同一個景的 keyframe：每張 1 支頭尾同一張的片段循環接（只正放、不剪頭尾，取 0.5–14.5 秒、接縫 cross fade 2 秒），換 keyframe 時 cross fade 6 秒；intro（暗→亮）與 3-C（光淡→光明顯）另有 1 支頭尾不同的過場片段只播一次";

const LTX_METHOD =
  "LTX 2.5 720P 15 秒，頭尾幀同一張 keyframe；每支取 2–12.5 秒輪流接，片段間 cross fade 3 秒";

/* ---------------------------------------------------------------------
 * 場景（上方分頁）。每個場景欄位：
 *   id       分頁編號，也用在段落錨點
 *   dir      素材資料夾名稱（assets/data/ 底下）
 *   title    分頁名稱
 *   length   總長 "mm:ss"，時間軸用它算比例
 *   period   時段說明
 *   base     （選填）基準圖；有寫才會出現「基準圖 已選」區塊
 *   candidates（選填）基準圖候選清單；沒有 base 時顯示「候選，待選」
 *   preview  （選填）預覽影片；有寫時間軸就能點擊跳轉、顯示紅色播放線
 *   drums    （選填）實拍鼓點區間 [{ start: "mm:ss", end: "mm:ss", label? }]，
 *            顯示在時間軸最上方的粉紫色橫條；可寫多段，label 預設「實拍鼓點」
 *   effects  （選填）特效清單 [{ kind, label, start: "mm:ss", end: "mm:ss" }]，畫在時間軸下方：
 *              kind "constant" 常駐效果（藍）、"vfx" 特效（橘）、
 *              "drum" 跟實拍鼓點綁定的特效（紫）、"state" 畫面狀態說明（灰字）
 *            段落左欄也會列出和該段時間重疊的特效
 *   sections 段落陣列，見下方
 *
 * 段落欄位：
 *   id        段落代號（intro、1-A…）
 *   time      "mm:ss–mm:ss"，決定在時間軸上的位置
 *   idea      段落說明
 *   keyframes keyframe 圖片清單
 *   clips     （選填）片段影片清單
 *   at        （選填）每張 keyframe 在時間軸上的起始秒數；null = 不排進時間軸
 *             沒寫時 keyframe 平均分佈在段落內
 *   fades     （選填）每張 keyframe 的 cross fade 秒數
 *   method    （選填）作法；沒寫顯示「還沒有片段，只有 keyframe」
 *   note      （選填）備註
 * ------------------------------------------------------------------- */
window.SCENES = [
  {
    id: "01",
    dir: "01-reflection",
    title: "倒影",
    length: "11:35",
    period: "上午 → 下午",
    preview: "user/preview-edit-0930-3-web.mp4",
    base: [ // Styleframe：第 1 張使用者提供（原本是 r5/keyframes/base-lotus-blue-R5E75W.png）；2026-10-22 使用者再加 2 張
      "user/keyframes/base-lotus-reflection.webp",
      "user/keyframes/styleframe-2-ink-swirl.webp",
      "user/keyframes/styleframe-3-blue-ripples.webp",
    ],
    drums: [{ start: "00:45", end: "02:59" }], // 實拍鼓點
    cues: { label: "低音重拍", times: [402.4, 428.41, 476.41, 502.4, 542.41, 662.39, 685.95], greenLabel: "簫／殘影", greenTimes: [105, 134, 153, 164, 204, 222, 245, 307, 336, 345] },
    effects: [ // 特效（分鏡稿 2026-10-19 調整版本；VFX 起訖依稿上位置估計）
      { kind: "state", label: "破碎的波形，逐漸緩和成平穩水面", start: "00:00", end: "00:50" }, // 依分鏡稿（使用者 10-20 改回；10-16 曾改成清晰 → 破碎）
      { kind: "constant", label: "水面波動", start: "00:50", end: "11:09" },
      { kind: "drum", label: "控制畫面水波強弱", start: "00:45", end: "02:59" },
      { kind: "vfx", color: "green", label: "簫控制畫面動態殘影顯示", start: "01:43", end: "02:29" },
      { kind: "vfx", label: "延展、拓展、延伸", start: "06:16", end: "09:04" },
      { kind: "state", label: "風又開始吹拂，畫面開始變得破碎、細碎", start: "11:09", end: "11:35" },
    ],
    sections: [
      {
        id: "intro",
        time: "00:00–00:50",
        idea: "破碎的波形逐漸緩和，變成平穩水面上清晰的蓮花倒影",
        keyframes: [
          "user/keyframes/intro-1-broken-ripples.webp", // 破碎的波形（使用者提供）
          "user/keyframes/intro-2-lotus-reflection.webp", // 寫實的蓮花倒影（使用者提供）
        ],
        note: "兩張依序：破碎 → 寫實（10-20 依分鏡稿改回）；片段用 6RBBP8 的倒放版",
        clips: ["r8/clips/intro-lotus-flow-6RBBP8-rev.mp4"],
        method: "LTX 2.5 720P 15 秒（6RBBP8，原本頭幀＝寫實蓮花、尾幀＝破碎波形），用 ffmpeg 倒放成破碎 → 平穩；水面像溪流流動，打散的長條慢慢聚回倒影，沒有圓形漣漪（倒放後約 8–12 秒水上的花從左上滑入，略像鏡頭移動）",
      },
      {
        id: "1-A",
        time: "00:50–06:16",
        idea: "思緒飄盪擺動；波光粼粼，加入不一樣的顏色倒影；陽光影響顏色，倒影顏色變換",
        keyframes: [
          "user/keyframes/1-A-soft-ghost.webp", // 柔和水波＋花朵殘影（使用者提供，已去掉右上角面板；取代 r7 M39X2P）
          "user/keyframes/1-A-d3-soft-glints.webp", // 柔和水波＋殘影＋波光（使用者提供，已去面板；原 r6/keyframes/d3-dream-glints-8TTH9B.png）
          "user/keyframes/1-A-d4-soft-sway.webp", // 柔和水波＋花朵晃動殘影（使用者提供，已去面板；原 r6/keyframes/d4-dream-teal-W31M48.png）
          "user/keyframes/1-A-d5-soft-shimmer.webp", // 柔和水波＋殘影＋中央波光（使用者提供，已去面板；原 r6/keyframes/d5-dream-mauve-96LG82.png）
        ],
      },
      {
        id: "1-B",
        time: "06:16–11:09",
        idea: "延展、拓展、延伸",
        keyframes: ["r7/keyframes/d6-stretch-1K30CH.webp"], // r7：水平拉長的筆觸（原 r6/keyframes/d6-dream-streaks-IESMH4.png）
      },
      {
        id: "1-C",
        time: "11:09–11:35",
        idea: "風又開始吹拂，畫面開始變得破碎、細碎",
        keyframes: ["user/keyframes/base-lotus-reflection.webp"],
        note: "10-19 分鏡稿把 1-C 從「緩緩回歸最初」改成風吹破碎；keyframe 還是清晰的基準圖，待換", // 回到基準圖（原 r5/keyframes/l7-afternoon-6W0ANZ.png）
      },
    ],
  },
  {
    id: "02",
    dir: "02-grassland",
    base: [ // Styleframe：2026-10-22 使用者提供的 3 張
      "user/keyframes/styleframe-1-blue-night-grass.jpg",
      "user/keyframes/styleframe-2-golden-grass.jpg",
      "user/keyframes/styleframe-3-green-white-grass.jpg",
    ],
    title: "草原",
    length: "07:14",
    period: "清晨 → 傍晚、黃昏",
    preview: "user/preview-edit-0919-web.mp4",
    drums: [{ start: "04:40", end: "05:44" }], // 實拍鼓點
    cues: { label: "重拍", times: [27.77, 66.91, 92.86, 132.13, 171.25, 197.35, 262.56, 356.49] },
    effects: [ // 特效（2026-10-22 依使用者提供的段落安排圖更新；VFX 起訖依圖上位置）
      { kind: "state", label: "天色漸亮染亮草原", start: "00:00", end: "03:43" },
      { kind: "constant", label: "草浪擺動", start: "03:43", end: "06:42" },
      { kind: "vfx", label: "風開始吹拂", start: "01:11", end: "03:58" },
      { kind: "drum", label: "光線染金草原", start: "04:40", end: "05:44" },
      { kind: "vfx", label: "強風吹拂草原、花瓣飛掠過鏡頭", start: "05:57", end: "06:42" },
      { kind: "state", label: "太陽西下，草原變暗，只剩草間反光的白反覆擺動", start: "06:42", end: "07:14" },
    ],
    sections: [ // 2026-10-22 依使用者提供的段落安排圖：intro 00:00–03:43、2-A 03:43–05:57、2-B 05:57–06:42（05:57 轉折）、2-C 06:42–07:14；原 2-A-1 併入 2-A，keyframe／片段依時間分到新段落
      {
        id: "intro",
        time: "00:00–03:43",
        idea: "天色漸亮染亮草原；01:11 起風開始吹拂",
        keyframes: [
          "r6/keyframes/g1-overcast-dawn-05Y997.png",
          "r7/keyframes/g2-overcast-morning-A6X6I6.png",
          "r7/keyframes/g3-clouds-breaking-78TSYS.png",
          "r3-keyframes/k6-daylight-OQTYZK.png",
        ],
        at: [0, 23, 66, 154],
        fades: [0, 8, 10, 12],
        clips: [
          "r8/clips/g1-overcast-dawn-JWV0B3.mp4",
          "r8/clips/g2-overcast-morning-UM5P9T.mp4",
          "r8/clips/g3-clouds-breaking-LTL561.mp4",
          "r8/clips/k6-daylight-R3L67W.mp4",
        ],
        method: LTX_METHOD,
        note: "Connect Cut（接上一段）：淺亮的反光與深色的背景被風吹拂擺動。g3 片段裡受光區會移動。2026-10-22 段落改到 03:43，原 2-A 的 k6 移進來；g4（X0NBD5、NDTNPA）已移除",
      },
      {
        id: "2-A",
        time: "03:43–05:57",
        idea: "常駐草浪擺動；光線染金草原（實拍鼓點 04:40–05:44）",
        keyframes: [
          "r5/keyframes/kf1-specks-very-sparse-BE9VH2.png",
          "r5/keyframes/kf2-specks-sparse-YP2GZH.png",
          "r5/keyframes/kf3-specks-moderate-3PZ2SX.png",
        ],
        at: [228, 268, 308],
        fades: [20, 20, 20],
        clips: [
          "r8/clips/kf1-specks-sway-96SMO6.mp4",
          "r5/clips/e-specks-sparse-LSKM27.mp4",
          "r8/clips/kf3-specks-sway-TPO6DC.mp4",
          "r5/clips/g-pollen-glints-EY2VJ8.mp4",
        ],
        method: `${LTX_METHOD}。花量 keyframe 之間用 20 秒 cross fade；kf3 與花粉亮點片段交替`,
        note: "2026-10-22 合併原 2-A（kf1、kf2）與原 2-A-1（kf3、花粉亮點）。沿用舊素材（花慢慢變多），還沒有染金的畫面",
      },
      {
        id: "2-B",
        time: "05:57–06:42",
        idea: "轉折（05:57）：強風吹拂草原、花瓣飛掠過鏡頭",
        keyframes: [
          "r5/keyframes/kf3-specks-moderate-3PZ2SX.png",
          "r5/keyframes/kf1-specks-very-sparse-BE9VH2.png",
          "r3-keyframes/k6-daylight-OQTYZK.png",
        ],
        at: [350, 374, 389],
        fades: [3, 12, 12],
        clips: [
          "r8/clips/kf3-gust-UOUEVW.mp4",
          "r8/clips/kf3-specks-sway-TPO6DC.mp4",
          "r8/clips/kf1-specks-sway-96SMO6.mp4",
          "r8/clips/k6-daylight-R3L67W.mp4",
        ],
        method: "轉折：05:50–06:05 放 kf3 的強風片段（前後 cross fade 3 秒）；之後花量反向遞減 kf3 → kf1 → k6，cross fade 12 秒",
        note: "沿用舊 2-B-2 的素材",
      },
      {
        id: "2-C",
        time: "06:42–07:14",
        idea: "太陽西下，草原變暗，只剩草間反光的白反覆擺動",
        keyframes: ["r6/keyframes/g6-afternoon-U5S5VC.png"],
        at: [397],
        fades: [10],
        clips: ["r8/clips/g6-afternoon-I1HDMY.mp4"],
        method: LTX_METHOD,
      },
    ],
  },
  {
    id: "03",
    dir: "03-sea",
    title: "海",
    length: "08:10",
    period: "清晨 → 傍晚、黃昏",
    base: [ // Styleframe：2026-10-22 使用者提供的 3 張；原本的基準圖 user/keyframes/base-styleframe.webp 依使用者要求拿掉（檔案保留）
      "user/keyframes/styleframe-2-spray-rocks.jpg",
      "user/keyframes/styleframe-3-misty-rays.jpg",
      "user/keyframes/styleframe-4-crashing-wave.jpg",
    ],
    preview: "user/preview-edit-0919-web.mp4",
    cues: { label: "重拍", times: [44, 91, 146.39, 221.05, 300, 319.71, 341.04, 386.23, 446.39] },
    drums: [{ start: "00:44", end: "01:49" }], // 實拍鼓點
    effects: [ // 特效（分鏡稿 2026-10-19 調整版本；VFX 起訖依稿上位置估計）
      { kind: "state", label: "天色染亮海洋", start: "00:00", end: "00:52" },
      { kind: "constant", label: "海浪潮汐變化", start: "00:52", end: "07:16" },
      { kind: "drum", label: "重音模糊", start: "00:44", end: "01:49" },
      { kind: "vfx", label: "激起較大浪花", start: "01:30", end: "02:28" },
      { kind: "vfx", label: "激起較大浪花", start: "02:28", end: "03:47" },
      { kind: "vfx", label: "激起較大浪花", start: "03:47", end: "05:00" },
      { kind: "vfx", label: "雲隙光從雲層穿透灑落在海洋上", start: "05:00", end: "07:09" },
      { kind: "vfx", label: "激起較大浪花", start: "07:09", end: "07:25" },
      { kind: "state", label: "海洋不斷堆疊，浪花泡沫，染白畫面", start: "07:16", end: "08:10" },
    ],
    sections: [
      {
        id: "intro",
        time: "00:00–00:52",
        idea: "天漸漸亮起",
        keyframes: ["user/keyframes/ocean-01.jpg", "user/keyframes/ocean-02.jpg"], // Ocean_01、Ocean_02
        at: [0, 26],
        fades: [0, 6],
        note: "Connect Cut（接上一段）：暗處中的白點規律地擺動，如同海浪。 2026-10-22 依使用者要求：keyframe 換成使用者提供的 Ocean_01–07（user/keyframes/ocean-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r12 片段檔案保留）",
      },
      {
        id: "3-A",
        time: "00:52–01:30",
        idea: "海浪思緒翻攪；陰影讓海立體",
        keyframes: ["user/keyframes/ocean-02.jpg"], // Ocean_02
        at: [52],
        fades: [6],
        note: "2026-10-22 依使用者要求：keyframe 換成使用者提供的 Ocean_01–07（user/keyframes/ocean-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r12 片段檔案保留）",
      },
      {
        id: "3-B",
        time: "01:30–05:00",
        idea: "光線間接影響浪的明暗；海浪激起較大的浪花；海浪反覆翻攪，激起較大的浪花後平靜",
        keyframes: ["user/keyframes/ocean-03.jpg", "user/keyframes/ocean-04.jpg"], // Ocean_03、Ocean_04
        at: [90, 195],
        fades: [6, 6],
        note: "2026-10-22 依使用者要求：keyframe 換成使用者提供的 Ocean_01–07（user/keyframes/ocean-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r12 片段檔案保留）",
      },
      {
        id: "3-C",
        time: "05:00–07:09",
        idea: "海浪拍打礁岩激起浪花；雲隙光穿透雲層灑落海上",
        keyframes: ["user/keyframes/ocean-05.jpg", "user/keyframes/ocean-06.jpg"], // Ocean_05、Ocean_06
        at: [300, 365],
        fades: [6, 6],
        note: "2026-10-22 依使用者要求：keyframe 換成使用者提供的 Ocean_01–07（user/keyframes/ocean-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r12 片段檔案保留）",
      },
      {
        id: "3-D",
        time: "07:09–08:10",
        idea: "海洋不斷堆疊，浪花泡沫，染白畫面",
        keyframes: ["user/keyframes/ocean-07.jpg"], // Ocean_07
        at: [429],
        fades: [6],
        note: "2026-10-22 依使用者要求：keyframe 換成使用者提供的 Ocean_01–07（user/keyframes/ocean-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r12 片段檔案保留）",
      },
    ],
  },
  {
    id: "04",
    dir: "04-clouds",
    title: "雲",
    length: "08:39",
    period: "中午 → 傍晚、黃昏",
    preview: "user/preview-edit-0919-web.mp4",
    base: [ // Styleframe：2026-10-22 使用者提供的 2 張，取代 r2/keyframes/base-krea-a-HVS7DY.png（檔案保留）
      "user/keyframes/styleframe-1-sun-through-clouds.jpg",
      "user/keyframes/styleframe-2-radiant-mist.jpg",
    ],
    cues: { label: "重拍", times: [67, 219, 316.79, 479.04] },
    drums: [{ start: "02:35", end: "03:44" }], // 實拍鼓點
    effects: [ // 特效（分鏡稿 2026-10-19 調整版本；VFX 起訖依稿上位置估計）
      { kind: "state", label: "白色的雲霧往鏡頭飛，漸漸散開露出背景的天空", start: "00:00", end: "01:07" },
      { kind: "constant", label: "雲在天空縮時變化的動態效果", start: "01:07", end: "07:45" },
      { kind: "constant", label: "雲加入顏色變化", start: "05:22", end: "08:39" },
      { kind: "drum", label: "雲隙光從雲後露出", start: "02:35", end: "03:44" },
      { kind: "vfx", label: "加入飛鳥掠過畫面", start: "01:07", end: "02:08" },
      { kind: "vfx", label: "加入飛鳥掠過畫面", start: "03:39", end: "04:14" },
      { kind: "vfx", label: "加入飛鳥掠過畫面", start: "05:22", end: "06:31" },
      { kind: "vfx", label: "加入飛鳥掠過畫面", start: "07:18", end: "08:05" },
      { kind: "state", label: "天空漸漸染上夕陽的顏色", start: "07:45", end: "08:39" },
    ],
    sections: [
      {
        id: "intro",
        time: "00:00–01:07",
        idea: "風捲雲；雲與光影變化",
        keyframes: ["user/keyframes/cloud-01.jpg", "user/keyframes/cloud-02.jpg"], // 2026-10-22 使用者提供 Cloud_01、Cloud_02（536×300 縮圖；舊圖保留）
        note: "Connect Cut（接上一段）：延續上一個主題的白畫面；轉折在 01:07",
      },
      {
        id: "4-A",
        time: "01:07–05:22",
        idea: "加入飛鳥掠過畫面，殘雲較淡薄；雲朵時厚時疏，陽光改變，天空顏色漸漸變深；風捲殘雲，雲加入顏色變化",
        keyframes: ["user/keyframes/cloud-03.jpg", "user/keyframes/cloud-04.jpg"], // 2026-10-22 使用者提供 Cloud_03、Cloud_04（536×300 縮圖；舊圖保留）
        note: "陽光改變，天空色溫從上午逐漸轉為夕陽",
      },
      {
        id: "4-B",
        time: "05:22–07:18",
        idea: "雲朵變厚；雲隙光時不時滲過雲；飛鳥掠過",
        keyframes: ["user/keyframes/cloud-05.jpg", "user/keyframes/cloud-06.jpg"], // 2026-10-22 使用者提供 Cloud_05、Cloud_06（536×300 縮圖；舊圖保留）
      },
      {
        id: "4-C",
        time: "07:18–08:39",
        idea: "時間變晚，天空變得多彩",
        keyframes: ["user/keyframes/cloud-07.jpg"], // 2026-10-22 使用者提供 Cloud_07（536×300 縮圖；舊圖保留）
        note: "天空漸漸變成太陽下山前的夕陽色",
      },
    ],
  },
  {
    id: "05",
    dir: "05-desert",
    title: "沙漠",
    length: "06:55",
    period: "清晨 → 傍晚、黃昏",
    base: [ // 2026-10-22 使用者提供的 Styleframe 三張（取代 r4 AFV9LF，檔案保留）
      "user/keyframes/styleframe-1-gold-layers.webp",
      "user/keyframes/styleframe-2-gold-ridges.webp",
      "user/keyframes/styleframe-3-pastel-dunes.webp",
    ],
    preview: "user/preview-edit-0919-web.mp4",
    cues: { label: "重拍", times: [59.76, 171.74, 199.63, 269.76], greenLabel: "沙塵暴", greenTimes: [123] },
    drums: [{ start: "05:30", end: "06:55" }], // 實拍鼓點
    effects: [ // 特效（分鏡稿 2026-10-19 調整版本；VFX 起訖依稿上位置估計）
      { kind: "state", label: "沙漠顏色柔和，天漸漸亮起", start: "00:00", end: "01:01" },
      { kind: "constant", label: "沙漠地面捲起塵土", start: "01:01", end: "06:55" },
      { kind: "vfx", label: "陽光讓沙漠的對比變強", start: "01:01", end: "02:25" },
      { kind: "vfx", color: "green", label: "揚起漫天飛沙、沙塵暴（吹奏樂器 02:03）", start: "02:03", end: "03:33" },
      { kind: "vfx", label: "沙散去，地形變換", start: "02:34", end: "04:40" },
      { kind: "vfx", label: "模糊殘影", start: "03:33", end: "05:03" },
      { kind: "drum", label: "熱浪扭曲", start: "05:30", end: "06:55" },
      { kind: "vfx", label: "太陽漸西沉，環境顏色變成鮮豔的金黃色", start: "05:36", end: "06:55" },
      { kind: "vfx", label: "漸漸揚起飛沙，最後遮蓋畫面", start: "06:21", end: "06:55" },
    ],
    sections: [
      {
        id: "intro",
        time: "00:00–01:01",
        idea: "清晨天漸漸亮起，天空與色溫的變化",
        note: "Connect Cut（接上一段）：延續前一支畫面由上的藍漸層至下方的橘（如天空與沙漠）",
        keyframes: ["user/keyframes/desert-01.jpg"], // desert_01
        at: [0],
        fades: [0],
        note: "Connect Cut（接上一段）：延續前一支畫面由上的藍漸層至下方的橘（如天空與沙漠） 2026-10-22 依使用者要求：keyframe 換成使用者提供的 desert_01–06（user/keyframes/desert-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r7／r9 片段檔案保留）",
      },
      {
        id: "5-A",
        time: "01:01–02:03",
        idea: "光線照射讓沙的對比堅定",
        keyframes: ["user/keyframes/desert-02.jpg"], // desert_02
        at: [61],
        fades: [6],
        note: "2026-10-22 依使用者要求：keyframe 換成使用者提供的 desert_01–06（user/keyframes/desert-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r7／r9 片段檔案保留）",
      },
      {
        id: "5-B",
        time: "02:03–05:36",
        idea: "漫天飛砂不時穿插於沙丘間；陽光角度變化影響陰影與立體感，地面細沙閃爍；漫漫飛砂、細沙閃爍",
        keyframes: ["user/keyframes/desert-03.jpg", "user/keyframes/desert-04.jpg", "user/keyframes/desert-05.jpg"], // desert_03、desert_04、desert_05
        at: [123, 194, 265],
        fades: [6, 6, 6],
        note: "2026-10-22 依使用者要求：keyframe 換成使用者提供的 desert_01–06（user/keyframes/desert-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r7／r9 片段檔案保留）",
      },
      {
        id: "5-C",
        time: "05:36–06:55",
        idea: "太陽西沉，環境顏色變成鮮豔的金黃色；漸漸揚起飛沙，最後遮蓋畫面",
        note: "原 5-D（10-19 分鏡稿改名 5-C）。順序依腳本：先太陽西沉（d7），再漸漸揚起飛沙遮蓋畫面（d8）。結尾：畫面顏色越來越均勻、越淺白，最後畫面變成素色底",
        keyframes: ["user/keyframes/desert-06.jpg"], // desert_06
        at: [336],
        fades: [6],
        note: "原 5-D（10-19 分鏡稿改名 5-C）。順序依腳本：先太陽西沉（d7），再漸漸揚起飛沙遮蓋畫面（d8）。結尾：畫面顏色越來越均勻、越淺白，最後畫面變成素色底 2026-10-22 依使用者要求：keyframe 換成使用者提供的 desert_01–06（user/keyframes/desert-0N.jpg，536×300 縮圖）；片段先拿掉，等使用者提供新影片（r7／r9 片段檔案保留）",
      },
    ],
  },
];

/* 公開版：點數紀錄不公開 */
window.SPENDING = null;
