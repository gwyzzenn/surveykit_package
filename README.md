# @gwyzzenn/survey-kit

NPS · CES · CSAT 三合一調查 Popover 套件，供公司各內部系統引用。

## 安裝

在專案根目錄建立 `.npmrc`：

```
@gwyzzenn:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Token 需有 `read:packages` 權限，到 GitHub → Settings → Developer settings → Personal access tokens 產生。

```bash
npm install @gwyzzenn/survey-kit
```

## 使用

```js
import { SurveyKit } from '@gwyzzenn/survey-kit'
import '@gwyzzenn/survey-kit/dist/survey-kit.css'

// 基本用法
SurveyKit.open('NPS')
SurveyKit.open('CES')
SurveyKit.open('CSAT')

// 完整用法
SurveyKit.open('CES', {
  cooldown: 90,  // 同一用戶 90 天內不重複顯示
  onSubmit: (data) => {
    fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
})
```

## onSubmit 資料格式

```json
{
  "type": "CES",
  "score": 3,
  "tags": [],
  "comment": "步驟有點多",
  "page": "/checkout",
  "ts": "2025-06-09T10:30:00.000Z"
}
```

| 欄位 | 說明 |
|------|------|
| `type` | `NPS` / `CES` / `CSAT` |
| `score` | NPS: 0–10，CES: 1–7，CSAT: 1–5 |
| `tags` | NPS 標籤選取結果（CES/CSAT 為空陣列） |
| `comment` | 用戶文字留言（可能為空字串） |
| `page` | 觸發頁面路徑 |
| `ts` | ISO 8601 時間戳 |

## 其他 API

```js
SurveyKit.close('NPS')         // 手動關閉
SurveyKit.clearCooldown('NPS') // 清除特定類型冷卻（測試用）
SurveyKit.clearCooldown()      // 清除所有冷卻
```

## 典型觸發情境

```js
// ERP — 採購流程送出後
async function onOrderSubmit() {
  await doSubmit()
  setTimeout(() => SurveyKit.open('CES', { cooldown: 90, onSubmit }), 1500)
}

// CRM — 客服對話關閉後
function onChatClose() {
  SurveyKit.open('CSAT', { cooldown: 30, onSubmit })
}

// 季度 NPS — 登入後自動判斷（cooldown 控制頻率）
window.addEventListener('DOMContentLoaded', () => {
  SurveyKit.open('NPS', { cooldown: 90, onSubmit })
})
```

## 版本

| 版本 | 說明 |
|------|------|
| 1.0.0 | 初始版本，NPS / CES / CSAT 三種問卷 |
