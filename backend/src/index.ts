import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts';
import { reportsRouter } from './routes/reports.ts';

type AppEnv = {
  Variables: {};
};

const app = new Hono<AppEnv>();

app.route('/reports', reportsRouter);

Deno.serve(app.fetch);