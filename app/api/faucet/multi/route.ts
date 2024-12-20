import { sendMultiEth } from "@/utils/eth";
import { getAddresses } from "@/utils/storage";
import { NextResponse } from "next/server";

export async function GET() {
  const addresses = await getAddresses();
  return NextResponse.json({
    addresses: addresses,
  });
}

export async function POST() {
  try {
    sendMultiEth();
    return NextResponse.json(
      { ok: true, message: "Transcation added in Queue." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
}
