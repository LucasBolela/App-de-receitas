import express from 'express';
import cors from 'cors';
import { routes } from './routes';
import bodyParser from 'body-parser';
require('dotenv').config();
require('@prisma/client');
import path from 'path';
import { ExceptionHandler } from './middleware/exceptionHanlder';


const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'http://localhost';

// App Express
const app = express();

// body-parser
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Cors
app.use(cors({
    origin: ['http://localhost:3000']
}));

app.use('/', routes);
app.use('/file', express.static(path.resolve(__dirname, '..', 'uploads')));

// Resposta padrão para quaisquer outras requisições:
app.use((req, res) => {
    res.status(404).send("Page not Found");
})

app.use(ExceptionHandler);
// Inicia o sevidor
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso ${HOSTNAME}:${PORT}`)
})