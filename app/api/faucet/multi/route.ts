import { sendMultiEth } from "@/utils/eth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  sendMultiEth();

  return NextResponse.json(
    { ok: true, message: "Transcation added in Queue." },
    { status: 200 }
  );
}
