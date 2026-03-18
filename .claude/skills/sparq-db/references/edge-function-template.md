# Edge Function Template — Annotated Reference

This template shows the standard pattern for Supabase Edge Functions in Sparq Connection. Based on the existing `send-partner-invite` function.

---

## Full Template

```typescript
// supabase/functions/my-function/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import shared CORS headers
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // ── CORS preflight ────────────────────────────────────────────────
  // Every Edge Function must handle OPTIONS for browser requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Parse request body ────────────────────────────────────────
    const { userId, someParam } = await req.json();

    // ── Create Supabase client ────────────────────────────────────
    // Use service_role key for privileged operations (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Business logic ────────────────────────────────────────────
    const { data, error } = await supabase
      .from("some_table")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    // ── Return success ────────────────────────────────────────────
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // ── Error response ────────────────────────────────────────────
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

---

## Shared CORS Headers

```typescript
// supabase/functions/_shared/cors.ts

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
```

Every Edge Function imports this. Never define CORS headers inline.

---

## Existing Edge Functions

| Function | Directory | Purpose | Auth |
|---|---|---|---|
| `send-partner-invite` | `supabase/functions/send-partner-invite/` | Send invite email via SendGrid | service_role |
| `memory-operations` | `supabase/functions/memory-operations/` | Mem0 memory CRUD | service_role |

### Config (from `supabase/config.toml`)

```toml
[functions.send-partner-invite]
verify_jwt = true

[functions.memory-operations]
verify_jwt = true
```

---

## When to Use Edge Functions vs API Routes

| Use Case | Edge Function | API Route (`src/pages/api/`) |
|---|---|---|
| Email sending | Yes | No |
| Scheduled/cron tasks | Yes | No |
| Third-party webhooks (Stripe) | Yes | No |
| Service-role operations | Yes | Rarely |
| AI generation (LLM calls) | No | Yes |
| User-facing requests | No | Yes |
| Operations needing user JWT context | No | Yes |

**Rule**: If it needs `getAuthedContext()` and user JWT scoping, use an API route. If it needs `SUPABASE_SERVICE_ROLE_KEY` or runs on a schedule, use an Edge Function.

---

## Deployment

```bash
# Deploy a single function
supabase functions deploy my-function

# Deploy all functions
supabase functions deploy

# Test locally
supabase functions serve my-function --env-file .env.local
```

### Required Environment Variables

Edge Functions access these via `Deno.env.get()`:

| Variable | Source | Purpose |
|---|---|---|
| `SUPABASE_URL` | Auto-injected by Supabase | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase | Privileged DB access |
| `SUPABASE_ANON_KEY` | Auto-injected by Supabase | Public DB access |

Additional secrets (e.g., SendGrid API key) must be set via:
```bash
supabase secrets set SENDGRID_API_KEY=sg_...
```

---

## Real Example: send-partner-invite

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recipientEmail, senderName, inviteCode } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Construct invite link
    const inviteLink = `${Deno.env.get("SITE_URL")}/join-partner?code=${inviteCode}`;

    // Send email via SendGrid
    const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipientEmail }] }],
        from: { email: "noreply@sparqconnection.com", name: "Sparq Connection" },
        subject: `${senderName} invited you to Sparq Connection`,
        content: [
          {
            type: "text/html",
            value: `<p>${senderName} wants to grow together on Sparq Connection.</p>
                    <p><a href="${inviteLink}">Accept Invitation</a></p>
                    <p>This link expires in 7 days.</p>`,
          },
        ],
      }),
    });

    if (!sgResponse.ok) {
      throw new Error(`SendGrid error: ${sgResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
```

---

## Conventions Checklist

When creating a new Edge Function:

1. Create directory: `supabase/functions/<function-name>/index.ts`
2. Import CORS from `../_shared/cors.ts`
3. Handle `OPTIONS` preflight as the first check
4. Use `service_role` key (not anon key) for DB operations
5. Wrap all logic in try/catch with JSON error response
6. Always include `corsHeaders` in every response (success and error)
7. Add entry to `supabase/config.toml` with `verify_jwt` setting
8. Set any external API keys via `supabase secrets set`
9. Deploy with `supabase functions deploy <name>`
