export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const webhookUrl = "https://n8n.srv1196329.hstgr.cloud/webhook/LOC_BENNES";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = { raw: data };
    }

    return res.status(response.ok ? 200 : response.status).json({
      success: response.ok,
      status: response.status,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Webhook proxy error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Unknown error",
    });
  }
}
