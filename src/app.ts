import express from 'express';
import serverless from 'serverless-http';
import userRoutes from './routes/user.routes';
import operationRoutes from './routes/operation.routes';
import recordRoutes from './routes/record.routes';
import connectDB from './config/database';
import bodyParser from 'body-parser';
import { environment } from './config/environment';
import seedRoutes from './routes/seed.routes.ts';

const app = express();
const apiVersion = environment.API_VERSION;

connectDB();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(`/api/${apiVersion}/seed`, seedRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/operations`, operationRoutes);
app.use(`/api/${apiVersion}/records`, recordRoutes);


// export default app;

export const handler = serverless(app);

