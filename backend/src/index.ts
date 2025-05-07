import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { Hono } from "hono";
import { cors } from "hono/cors";  
import { reportsRouter } from "./routes/reports.ts";

type AppEnv = {
  Variables: {};
};

const app = new Hono<AppEnv>();

app.use('/*', cors({
  origin: ['http://localhost:5173'], // Your Vue dev server URL
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

app.route('/reports', reportsRouter);

Deno.serve(app.fetch);