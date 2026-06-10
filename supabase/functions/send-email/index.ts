// Supabase Edge Function: send-email
// This function runs on Deno and integrates with the Resend API to deliver email notifications securely.
// Deploy this function to Supabase using:
// supabase functions deploy send-email
// Make sure to set the RESEND_API_KEY secret in Supabase:
// supabase secrets set RESEND_API_KEY=re_your_api_key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    // When invoked by a Supabase Database Webhook trigger,
    // the row data is nested inside payload.record
    const record = payload.record || payload;
    const { name, email, subject, message } = record

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required contact details (name, email, or message)." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY secret is not set in Supabase Vault." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deliver email using Resend HTTP REST API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Portfolio Form <onboarding@resend.dev>', // Defaults to Resend's onboarding sender
        to: 'ganjikarthik999@gmail.com',
        subject: `New Portfolio Contact Message: ${subject || 'No Subject'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
            <h2 style="color: #6366f1; margin-top: 0;">New Contact Message Received</h2>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #edf2f7; margin-top: 15px;">
              <p style="margin-top: 0; color: #4a5568; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Message Body</p>
              <p style="margin: 0; white-space: pre-wrap; color: #2d3748; line-height: 1.6;">${message}</p>
            </div>
          </div>
        `,
      }),
    })

    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.message || "Resend API error response.");
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
