// Define allowed origins
export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080", 
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
  "http://localhost:8084",
  "http://localhost:8085",
  // Add your production domain when ready
  // "https://your-production-domain.com"
];

// Static CORS headers that don't depend on origin
export const staticCorsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
};

// For backwards compatibility
export const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8083",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
};

// Get dynamic CORS headers based on the request's origin
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  
  // Return headers with appropriate Access-Control-Allow-Origin
  return {
    ...staticCorsHeaders,
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin || '') 
      ? origin || allowedOrigins[0] // Fallback to first origin if null
      : allowedOrigins[0], // Default to first allowed origin if not matched
  };
}
