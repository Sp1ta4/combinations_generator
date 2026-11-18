import express, { type Express } from 'express';
import indexRouter from './routes/index.js';
import { errorHandler } from './middlewares/error_handler.js';

const app: Express = express();

app.use(express.json());
app.use('/', indexRouter);
app.use(errorHandler);

export default app;