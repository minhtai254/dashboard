export const GOOGLE_SHEET_ID =
  process.env.GOOGLE_SHEET_ID ?? "1TRgx7qCotD1c6DbYB3ghjOuDq0iAYtXcnnk4rNty3ro";

export const GOOGLE_SHEET_TAB = process.env.GOOGLE_SHEET_TAB ?? "inspection";

/** Tự động đồng bộ từ Google Sheet mỗi 2 phút */
export const REFRESH_INTERVAL_MS = 2 * 60 * 1000;
export const REFRESH_INTERVAL_MINUTES = 2;

export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;

export function getSheetCsvUrl(sheetName = GOOGLE_SHEET_TAB) {
  const params = new URLSearchParams({
    format: "csv",
    sheet: sheetName,
  });
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?${params}`;
}
