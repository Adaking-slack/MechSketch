import express from 'express';
import cors from 'cors';
import otpRoutes from './routes/otpRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/otp', otpRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MechSketch Backend is running.' });
});

app.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
});
