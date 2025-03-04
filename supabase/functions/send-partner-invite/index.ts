import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface WebhookPayload {
  partnerEmail: string;
  inviteLink: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the request body
    const { partnerEmail, inviteLink } = await req.json() as WebhookPayload;

    // Validate input
    if (!partnerEmail || !inviteLink) {
      throw new Error('Missing required fields');
    }

    // Send email using your preferred email service
    // This is a placeholder - replace with your actual email sending logic
    // For example, using SendGrid, Postmark, etc.
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: partnerEmail }],
        }],
        from: { email: 'noreply@yourdomain.com' },
        subject: 'Join Your Partner\'s Relationship Journey',
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>You've Been Invited!</h1>
              <p>Your partner has invited you to join them on a relationship journey.</p>
              <p>Together, you'll explore activities designed to strengthen your connection and deepen your understanding of each other.</p>
              <div style="margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #666;">This invitation will expire in 7 days.</p>
            </div>
          `,
        }],
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
}); 