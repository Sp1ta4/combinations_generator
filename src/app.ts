import express, { type Express } from 'express';
import indexRouter from './routes/index.js';
import { errorHandler } from './middlewares/error_handler.js';
import cors from 'cors';
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);
app.use(errorHandler);

export default app;