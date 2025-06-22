import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    message: 'Welcome to the Express API!',
    data: {
      version: '1.0.0',
      endpoints: {
        home: '/',
        about: '/about',
        api: '/api/users'
      }
    }
  };
  res.json(response);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;