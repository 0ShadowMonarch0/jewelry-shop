import 'dotenv/config';
import { createApp } from '../server/app';

// Vercel's Node runtime accepts a default-exported (req, res) handler —
// an Express app is exactly that, so it can be exported directly with no
// serverless-http shim. Static assets (dist/) are served by Vercel itself;
// this function only ever receives the /api/* requests routed to it by
// vercel.json.
export default createApp();
