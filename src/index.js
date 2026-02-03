import express from 'express';
import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matchRoutes } from './routes/matches.route.js';


const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use("/matches",matchRoutes)

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nClosing database connection...');
  await pool.end();
  process.exit(0);
});
