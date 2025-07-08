import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import courseRoutes from './routes/courseRoutes.js';

dotenv.config();
const app = express();
const PORT = 4000;

// ✅ Define correct CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // your React app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // allow cookies / headers
};

// ✅ Use CORS correctly — must be FIRST
app.use(cors(corsOptions));

// ✅ Manually handle preflight (OPTIONS) requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);

app.get('/', (req, res) => {
  res.send('API is working!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});