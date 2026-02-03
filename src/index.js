import express from 'express';
import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { demoUsers } from './db/schema.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz API' });
});

// CRUD Routes
// CREATE: Add a new user
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name, email })
      .returning();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ: Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await db.select().from(demoUsers);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ: Get user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, parseInt(id)));
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE: Update a user
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name, email })
      .where(eq(demoUsers.id, parseInt(id)))
      .returning();
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Remove a user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(demoUsers).where(eq(demoUsers.id, parseInt(id)));
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
