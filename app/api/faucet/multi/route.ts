import { sendMultiEth } from "@/utils/eth";
import { NextResponse } from "next/server";

export async function POST() {
  sendMultiEth();

  return NextResponse.json(
    { ok: true, message: "Transcation added in Queue." },
    { status: 200 }
  );
}
