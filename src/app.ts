import express from 'express';
import userRoutes from './routes/user.routes';
import operationRoutes from './routes/operation.routes';

const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/operations', operationRoutes);

export default app;