import express from 'express';
import cookieParser from 'cookie-parser';
import enterpriseRoutes from './routes/enterpriseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import timeRoutes from './routes/timeRoutes.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser()); // Habilita o uso de cookies
app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:3001', // Permite apenas solicitações do frontend
        credentials: true, // Permite o envio de cookies
    })
);

/*
app.use(express.static(path.join(__dirname, '../../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});
*/

app.use('/api', enterpriseRoutes);
app.use('/api', userRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', timeRoutes);


// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});