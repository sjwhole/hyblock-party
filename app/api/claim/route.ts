import { Claim } from "@/types/request/claim";
import { sendEther } from "@/utils/eth";
import { hasClaimed } from "@/utils/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body: Claim = await request.json();
  const recipientAddress = body.address;

  if (await hasClaimed(recipientAddress)) {
    return NextResponse.json(
      { ok: false, message: "Address has already claimed." },
      { status: 200 }
    );
  } else {
    sendEther(recipientAddress, 0.01);
    return NextResponse.json(
      { ok: true, message: "Transcation added in Queue." },
      { status: 200 }
    );
  }
}
