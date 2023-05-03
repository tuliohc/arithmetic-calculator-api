import express from 'express';
import serverless from 'serverless-http';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import operationRoutes from './routes/operation.routes';
import recordRoutes from './routes/record.routes';
import connectDB from './config/database';
import { environment } from './config/environment';
import seedRoutes from './routes/seed.routes.ts';

const app = express();
const apiVersion = environment.API_VERSION;

connectDB();

const corsOptions = {
  origin: 'http://localhost:3001',
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());

app.use(`/api/${apiVersion}/seed`, seedRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/operations`, operationRoutes);
app.use(`/api/${apiVersion}/records`, recordRoutes);


// export default app;

export const handler = serverless(app);

