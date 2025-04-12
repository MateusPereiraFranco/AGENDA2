// controller/resetController.js
import client from '../config/database.js';
import { sendEmail } from '../utils/notificationService.js'; // criaremos isso
import crypto from 'crypto';

export const requestReset = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email é obrigatório' });

    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    try {

        await client.query(
            'INSERT INTO reset_token (email, token, expires_at) VALUES ($1, $2, $3)',
            [email, token, expiresAt]
        );

        await sendEmail(email, 'Código para redefinir sua senha', `Seu código é: ${token}`);

        res.status(200).json({ message: 'Código enviado com sucesso' });
    } catch (err) {
        console.error('Erro ao gerar token:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

export const verifyToken = async (req, res) => {
    const { email, token } = req.body;

    try {
        const result = await client.query(
            'SELECT * FROM reset_token WHERE email = $1 AND token = $2 AND usado = false AND expires_at > NOW()',
            [email, token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }

        res.status(200).json({ message: 'Token válido' });
    } catch (err) {
        console.error('Erro ao verificar token:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};


import bcrypt from 'bcrypt';

export const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;

    try {
        const result = await client.query(
            'SELECT * FROM reset_token WHERE email = $1 AND token = $2 AND usado = false AND expires_at > NOW()',
            [email, token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }

        const hashed = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
        await client.query('UPDATE usuario SET senha = $1 WHERE email = $2', [hashed, email]);
        await client.query('UPDATE reset_token SET usado = true WHERE email = $1 AND token = $2', [email, token]);

        res.status(200).json({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
