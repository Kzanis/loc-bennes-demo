export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = await req.json();
    const webhookUrl = "https://n8n.srv1196329.hstgr.cloud/webhook/LOC_BENNES";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = { raw: data };
    }

    return new Response(
      JSON.stringify({ success: response.ok, status: response.status, data: parsed }),
      { status: response.ok ? 200 : response.status, headers }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { status: 500, headers }
    );
  }
}
