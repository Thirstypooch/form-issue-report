import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { reportsRouter } from "./routes/reports.ts";

type AppEnv = {
  Variables: {};
};

const app = new Hono<AppEnv>();

// --- THIS IS THE CORRECTED SECTION ---
// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Your local Vue dev server
  Deno.env.get('URL'),      // Netlify's main production URL for your site
  Deno.env.get('DEPLOY_PRIME_URL') // Netlify's URL for deploy previews
].filter(Boolean) as string[]; // Filters out any undefined values

app.use('/*', cors({
  origin: (origin, c) => {
    // Allow requests from the defined origins
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    // You might want to return a default allowed origin or handle errors
    // For now, returning the first allowed origin as a default if needed
    return allowedOrigins[0];
  },
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));
// --- END OF CORRECTED SECTION ---


app.route('/reports', reportsRouter);

// This exports the app for Netlify Functions
export default app;