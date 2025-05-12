// controller/resetController.js
import pool from '../config/database.js';
import { sendEmail } from '../utils/notificationService.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// 💡 Utilitário para gerar data UTC com precisão
const generateUTCExpiration = (minutes = 10) => {
    return new Date(Date.now() + minutes * 60 * 1000).toISOString(); // retorna ISO 8601 em UTC
};

export const requestReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 👈 Objeto Date real

    try {
        // Verifica se o usuário existe
        const userResult = await pool.query('SELECT id_usuario FROM usuario WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Remove tokens antigos
        await pool.query('DELETE FROM reset_token WHERE email = $1', [email]);

        // Insere novo token com validade
        await pool.query(
            'INSERT INTO reset_token (email, token, expires_at) VALUES ($1, $2, $3)',
            [email, token, expiresAt]
        );

        // Envia por e-mail
        await sendEmail(email, 'Código para redefinir sua senha', `Seu código é: ${token}`);

        return res.status(200).json({ message: 'Código enviado com sucesso' });
    } catch (err) {
        console.error('Erro ao gerar token:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

export const verifyToken = async (req, res) => {
    const { email, token } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM reset_token 
             WHERE email = $1 AND token = $2 AND usado = FALSE AND expires_at > NOW()`,
            [email, token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }

        return res.status(200).json({ message: 'Token válido' });
    } catch (err) {
        console.error('Erro ao verificar token:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

export const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM reset_token 
             WHERE email = $1 AND token = $2 AND usado = FALSE AND expires_at > NOW()`,
            [email, token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }

        const hashed = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));

        // Atualiza senha
        await pool.query('UPDATE usuario SET senha = $1 WHERE email = $2', [hashed, email]);

        // Marca token como usado (pode ser deletado ou marcado como usado)
        await pool.query('UPDATE reset_token SET usado = TRUE WHERE email = $1 AND token = $2', [email, token]);

        return res.status(200).json({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
