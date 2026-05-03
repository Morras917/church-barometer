import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount } = body;

  if (typeof amount !== "number" || amount < 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("fundraising")
    .update({ current: amount })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, current: amount });
}
