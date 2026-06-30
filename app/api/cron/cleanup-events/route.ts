import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get all events
    const { data: events, error: fetchError } = await supabase
      .from("events")
      .select("*");

    if (fetchError) throw fetchError;

    let movedCount = 0;

    if (events) {
      for (const event of events) {
        const eventDate = new Date(event.date);

        // If the date is valid and has passed, move to gallery
        if (!isNaN(eventDate.getTime()) && eventDate < today) {
          // Insert into past_events
          await supabase.from("past_events").insert([{
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            price: event.price,
            tag: event.tag,
            image_url: event.image_url,
          }]);

          // Delete from events
          await supabase.from("events").delete().eq("id", event.id);

          movedCount++;
        }
      }
    }

    // 2. Delete past_events older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: deletedOld, error: deleteError } = await supabase
      .from("past_events")
      .delete()
      .lt("archived_at", sevenDaysAgo.toISOString())
      .select();

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      movedToGallery: movedCount,
      permanentlyDeleted: deletedOld?.length || 0,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}