# Jack & Clemence 電子喜帖

2026-12-12，台中林酒店 3樓全球廳。

本版本保留原 Wix 網站的響應式版面、信封封面疊圖、照片裁切、文字、撕紙分隔與配色，移除 Wix 執行環境及廣告。

- `index.html` / `style.css`：靜態頁面與原站響應式樣式。
- `script.js` / `player.css`：Start Now 對齊音樂區段頂端，以及自訂音樂播放控制。
- `tools/player-controls.html`：重建腳本與頁面共用的播放器控制列。
- `countdown.html`：依 `2026-12-12T12:12:00+08:00` 倒數，到期停止計時。
- `rsvp.html`：嵌入原站 Google Forms；回覆仍送往原本的 Google 表單。
- `assets/`：本地圖片、字型與 MP3，不必由 Wix CDN 載入。
- `assets-manifest.json`：來源 URL、檔案大小與 SHA-256。

## 本機預覽

```sh
python -m http.server 8080
```

GitHub Pages 可直接從 `main` 分支根目錄發佈，無需 npm、建置流程或伺服器。

## 維護

HTML 中保留元件識別碼，方便比對原站 CSS。字型已依現有文案裁切；新增文案時須重新產生字型子集，避免缺字。圖片以 WebP quality 90 儲存。Google Forms 是唯一必要的外部功能，需網路及原表單保持開放。

重建腳本位於 `tools/`，需要 `beautifulsoup4`、`Pillow`、`fonttools`、`brotli`。捲動進場使用原站 CSS 動畫，透過 IntersectionObserver 觸發，支援減少動態效果設定。音樂使用本地自訂控制列，保留原站封面、字型與配色；支援播放／暫停、進度、靜音及音量。停用 JavaScript 時回退為原生播放器。
