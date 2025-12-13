import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import triageRoutes from '../routes/triageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins for hackathon
app.use(express.json());

// Routes
app.use('/api/triage', triageRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('GabayMed Backend is Active 🟢');
});

// --- THE HYBRID LOGIC ---

// 1. Export the App (Critical for Vercel)
export default app;

// 2. Start the Server ONLY if running locally
// Vercel automatically sets process.env.VERCEL to "1".
// If that variable is MISSING, we assume we are on localhost.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on http://localhost:${PORT}`);
  });
}