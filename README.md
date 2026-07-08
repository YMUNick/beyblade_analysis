# BEY SCAN X ｜ 戰鬥陀螺天梯查詢

搜尋你的 Beyblade X 戰刃，對照台灣天梯，查看它的**類型、天梯階級、原裝固鎖／軸心、建議配置與來源產品**。

🔗 線上使用：https://ymunick.github.io/beyblade_analysis/

## 功能

- 🔎 **搜尋**：輸入中文名（如「龍劍」）或型號（如「BX-34」）即時篩選
- 🏷️ **類型篩選**：攻擊 / 防禦 / 持久 / 平衡 / 特殊
- 📊 **天梯分析卡**：類型徽章、天梯階級、原裝配件（含階級）、建議配置、來源產品
- 📷 **個人紀錄**：可附上自己的陀螺照片（僅存在你的裝置，不會上傳）

> 沒有 AI 影像辨識，也不需要任何 API 金鑰 —— 純靜態網頁，資料來自天梯快照。

## 資料來源

天梯資料為 [@stan_yao 的 Beyblade X Tier List](https://stan-yao.github.io/beyblade_x_tier/) Google Sheet 之**快照**（本版更新日：2026-07-08）。
本專案為非官方粉絲工具，天梯定位僅供參考。

## 更新天梯資料

資料因跨網域限制無法在瀏覽器即時抓取，故以快照方式內嵌。要更新時：

```bash
# 1. 重新抓取最新 CSV
curl -sL "https://docs.google.com/spreadsheets/d/1TBHOpcsv25bBfWERq14CBIy4P1G7j-qpPhmclx_nTWI/gviz/tq?tqx=out:csv" -o tools/sheet_raw.csv

# 2. 產生 blades.json，並把資料注入 index.html
cd tools && node build_data.js && node build_index.js
```

之後 commit + push，GitHub Actions 會自動重新部署。

## 部署

推送到 `main` 分支時，`.github/workflows/deploy.yml` 會自動將網站發佈到 GitHub Pages。
