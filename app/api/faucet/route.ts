import { Claim } from "@/types/request/claim";
import { addAddress, isAddressAdded } from "@/utils/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // address?=param
  const address = request.nextUrl.searchParams.get("address") ?? "";
  if (await isAddressAdded(address)) {
    return NextResponse.json(
      { ok: false, message: "Address is already added." },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { ok: true, message: "Address is not added." },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body: Claim = await request.json();
  const recipientAddress = body.address;

  await addAddress(recipientAddress);

  return NextResponse.json(
    { ok: true, message: "Transcation added in Queue." },
    { status: 200 }
  );
}
