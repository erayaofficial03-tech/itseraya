import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: secure } = await supabase
      .from("secure_settings")
      .select("google_reviews_api_key")
      .eq("id", 1)
      .maybeSingle();
    const { data: settings } = await supabase
      .from("settings")
      .select("google_place_id, google_reviews_visible")
      .eq("id", 1)
      .maybeSingle();

    const apiKey = secure?.google_reviews_api_key;
    const placeId = settings?.google_place_id;

    if (!apiKey || !placeId) {
      return new Response(
        JSON.stringify({ error: "Missing Google Place ID or API key" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId,
    )}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== "OK") {
      return new Response(
        JSON.stringify({ error: json.error_message || json.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = json.result || {};
    return new Response(
      JSON.stringify({
        name: result.name,
        rating: result.rating,
        total: result.user_ratings_total,
        reviews: result.reviews || [],
        visible: settings?.google_reviews_visible !== false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
