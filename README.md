# SLPC Inspection Dashboard

Dashboard kiểu Power BI, kết nối trực tiếp với Google Sheets (tab **inspection**).

## Nguồn dữ liệu

- Google Sheet: [SLPC](https://docs.google.com/spreadsheets/d/1TRgx7qCotD1c6DbYB3ghjOuDq0iAYtXcnnk4rNty3ro/edit)
- Tab: `inspection`

## Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Cấu hình

Copy `.env.local.example` thành `.env.local` nếu cần đổi sheet:

```
GOOGLE_SHEET_ID=...
GOOGLE_SHEET_TAB=inspection
```

**Lưu ý:** Sheet cần được chia sẻ **"Anyone with the link can view"** để dashboard tải được dữ liệu qua CSV export.
