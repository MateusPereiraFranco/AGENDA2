import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuração do PostgreSQL
const client = new Client({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

client.connect()
    .then(() => console.log('Conexão com o PostgreSQL bem-sucedida'))
    .catch(err => console.error('Erro de conexão:', err.stack));

export default client;