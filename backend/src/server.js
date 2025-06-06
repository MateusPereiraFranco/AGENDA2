import express from 'express';
import cookieParser from 'cookie-parser';
import enterpriseRoutes from './routes/enterpriseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import timeRoutes from './routes/timeRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import cors from 'cors';
import './cron/cronJobs.js';
import helmet from 'helmet';

// Exemplo: máximo de 100 requisições a cada 15 minutos
const app = express();
app.use(cookieParser()); // Habilita o uso de cookies
app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:3001', // Permite apenas solicitações do frontend
        credentials: true, // Permite o envio de cookies
    })
);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://apis.google.com'],
            objectSrc: ["'none'"],
        },
    },
    crossOriginResourcePolicy: { policy: "same-origin" },
}));

app.use('/api', enterpriseRoutes);
app.use('/api', userRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', timeRoutes);
app.use('/api', permissionRoutes);


// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});