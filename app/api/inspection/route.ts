import { NextResponse } from "next/server";
import { fetchInspectionData } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchInspectionData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lỗi không xác định khi tải dữ liệu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
