import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { Hono } from "hono";
import { reportsRouter } from "./routes/reports.ts";

type AppEnv = {
  Variables: {};
};

const app = new Hono<AppEnv>();

app.route('/reports', reportsRouter);

Deno.serve(app.fetch);