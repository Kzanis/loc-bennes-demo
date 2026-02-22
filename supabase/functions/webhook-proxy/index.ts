import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Webhook proxy: Réception de la requête");
    const contentType = req.headers.get("content-type") || "";
    
    let body: BodyInit;
    let forwardHeaders: HeadersInit = {};
    
    if (contentType.includes("multipart/form-data")) {
      // Transmettre le FormData tel quel avec le boundary
      console.log("Webhook proxy: Traitement multipart/form-data");
      body = await req.arrayBuffer();
      forwardHeaders["Content-Type"] = contentType; // Préserver le boundary
    } else {
      // Fallback JSON pour compatibilité
      console.log("Webhook proxy: Traitement JSON");
      const jsonBody = await req.json();
      console.log("Webhook proxy: Données reçues", JSON.stringify(jsonBody, null, 2));
      body = JSON.stringify(jsonBody);
      forwardHeaders["Content-Type"] = "application/json";
    }
    
    // Appel au webhook N8N
    const webhookUrl = "https://n8n.srv1196329.hstgr.cloud/webhook/FH_Negoce";
    console.log("Webhook proxy: Envoi vers", webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: body,
    });

    console.log("Webhook proxy: Statut de réponse", response.status);
    const responseText = await response.text();
    console.log("Webhook proxy: Réponse du serveur", responseText);
    
    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        message: responseText
      }),
      { 
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Webhook proxy: Erreur", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
