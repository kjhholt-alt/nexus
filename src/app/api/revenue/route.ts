import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("product_id");
  const days = parseInt(url.searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  let query = supabase
    .from("buildkit_revenue")
    .select("*")
    .gte("event_date", since.toISOString().split("T")[0])
    .order("event_date", { ascending: false });

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalMRR = (data || []).filter(r => r.recurring).reduce((sum, r) => sum + Number(r.amount), 0);
  const totalRevenue = (data || []).reduce((sum, r) => sum + Number(r.amount), 0);

  return NextResponse.json({ events: data, totalMRR, totalRevenue });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("buildkit_revenue")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
