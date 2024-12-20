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

  try {
    await addAddress(recipientAddress);

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
