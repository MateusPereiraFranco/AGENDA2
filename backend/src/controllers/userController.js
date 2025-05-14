import { getUsers, addUser, deleteUser, updateUser, getUserByEmail, verifyPassword, getUserName, updatePassword } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { encodeId, decodeId } from "../utils/hashids.js";

import Joi from 'joi';

const searchSchema = Joi.object({
    id: Joi.string().optional(),
    nome: Joi.string().optional(),
    email: Joi.string().email().optional(),
    senha: Joi.string().optional(),
    fk_empresa_id: Joi.string().optional(),
    tipo_usuario: Joi.string().optional(),
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sortBy: Joi.string().default('id_usuario'),
    order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

const checkAuthController = (req, res) => {
    const { id: id_usuario, email, tipo_usuario, fk_empresa_id } = req.user;

    return res.status(200).json({
        authenticated: true,
        user: {
            id_usuario: encodeId(id_usuario),
            email,
            tipo_usuario,
            fk_empresa_id: fk_empresa_id ? encodeId(fk_empresa_id) : null,
        },
    });
};


const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) return res.status(401).json({ message: 'Refresh token não fornecido' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Verifica se o token está revogado
        const { rows } = await pool.query(`
            SELECT * FROM refresh_token WHERE token = $1 AND revoked = FALSE AND expires_at > NOW()`,
            [refreshToken]);

        if (rows.length === 0) return res.status(403).json({ message: 'Refresh token inválido ou expirado' });

        const newAccessToken = jwt.sign({
            id: decoded.id,
            email: decoded.email,
            tipo_usuario: decoded.tipo_usuario
        }, process.env.JWT_SECRET, { expiresIn: '150m' });

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 100000,
        });

        res.status(200).json({ message: 'Access token renovado' });

    } catch (err) {
        console.error('Erro ao renovar token:', err);
        res.status(403).json({ message: 'Token inválido ou expirado' });
    }
};


const loginController = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
        const user = await getUserByEmail(email);
        if (!user) return res.status(401).json({ message: 'Email ou senha incorretos' });

        const senhaValida = await verifyPassword(senha, user.senha);
        if (!senhaValida) return res.status(401).json({ message: 'Email ou senha incorretos' });

        // Tokens
        const payload = { id: user.id_usuario, email: user.email, tipo_usuario: user.tipo_usuario, fk_empresa_id: user.fk_empresa_id };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '150m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Salva refresh no banco
        await pool.query(`
            INSERT INTO refresh_token (user_id, token, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
            [user.id_usuario, refreshToken]);

        // Envia access no cookie HTTP-only
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 100000,
        });

        // Envia refresh no cookie separado
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 100000,
        });

        res.status(200).json({
            message: 'Login bem-sucedido',
            success: true,
            user: {
                id_usuario: encodeId(user.id_usuario),
                email: user.email,
                tipo_usuario: user.tipo_usuario,
                fk_empresa_id: encodeId(user.fk_empresa_id)
            }
        });

    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};

const logoutController = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
        try {
            await pool.query(`UPDATE refresh_token SET revoked = TRUE WHERE token = $1`, [refreshToken]);
        } catch (err) {
            console.error('Erro ao revogar token:', err);
        }
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({ message: 'Logout bem-sucedido' });
};

const updatePasswordController = async (req, res) => {
    const token = req.cookies.access_token; // Corrigido nome do cookie

    if (!token) {
        return res.status(401).json({ message: 'Não autenticado' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica o access token
        const user = await getUserByEmail(decoded.email);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const valid = await verifyPassword(currentPassword, user.senha);
        if (!valid) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
        await updatePassword(user.id_usuario, hashedNewPassword); // Usa id do banco

        return res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar senha:', err);
        res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
};


const getUserNameController = async (req, res) => {
    const { id } = req.query;

    let decodedId;
    try {
        decodedId = decodeId(id);
    } catch {
        return res.status(400).send('ID inválido');
    }

    try {
        const userName = await getUserName(decodedId);

        if (!userName) {
            return res.status(404).send('Nenhum usuário encontrada');
        }

        res.status(200).json(userName);
    } catch (err) {
        console.error('Erro ao buscar nome do usuario:', err);
        res.status(500).send('Erro ao buscar nome do usuario');
    }
};


const getUsersController = async (req, res) => {
    const { error, value } = searchSchema.validate(req.query);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    if (value.fk_empresa_id) {
        try {
            value.fk_empresa_id = decodeId(value.fk_empresa_id);
        } catch {
            return res.status(400).send('ID da empresa inválido');
        }
    }

    try {
        const users = await getUsers(value);

        if (users.length === 0) {
            return res.status(404).send('Nenhum usuário encontrado');
        }
        const response = users.map(user => ({
            ...user,
            id_usuario: encodeId(user.id_usuario),
            fk_empresa_id: user.fk_empresa_id ? encodeId(user.fk_empresa_id) : null,
        }));
        return res.status(200).json(response);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        res.status(500).send('Erro ao buscar usuários');
    }
};


// Controlador para adicionar um nova usuario
const addUserController = async (req, res) => {
    const { nome, email, senha, fk_empresa_id, tipo_usuario } = req.body;

    if (!nome || !email || !senha || !fk_empresa_id || !tipo_usuario) {
        return res.status(400).json({
            error: 'Nome, email, senha, empresa e tipo são obrigatórios'
        });
    }

    let fk_empresa_id_decoded;

    try {
        fk_empresa_id_decoded = decodeId(fk_empresa_id);
    } catch {
        return res.status(400).json({ error: 'ID da empresa inválido' });
    }

    try {
        const newUser = await addUser(nome, email, senha, fk_empresa_id_decoded, tipo_usuario);
        res.status(201).json({
            success: true,
            data: {
                ...newUser,
                id_usuario: encodeId(newUser.id_usuario),
                fk_empresa_id: newUser.fk_empresa_id ? encodeId(newUser.fk_empresa_id) : null
            }
        });
    } catch (err) {
        console.error('Erro ao adicionar usuario:', err);

        // Tratamento específico para erro de e-mail duplicado
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Este e-mail já está cadastrado'
            });
        }

        // Erro genérico para outros casos
        res.status(500).json({
            error: 'Erro ao cadastrar usuário'
        });
    }
};

// Controlador para adicionar um novo usuario
const deleteUserController = async (req, res) => {
    const { id } = req.params; // Recebe os dados do corpo da requisição
    if (!id) {
        return res.status(400).send('ID é obrigatório para exclusão');
    }
    let decodedId;
    try {
        decodedId = decodeId(id);
    } catch {
        return res.status(400).send('ID inválido');
    }

    try {
        const user = await deleteUser(decodedId); // Chama o modelo para deletar o usuario
        if (!user) {
            return res.status(404).send('Usuario não encontrado');
        }
        user.id_usuario = encodeId(user.id_usuario); // Codifica o id do usuario
        user.fk_empresa_id = user.fk_empresa_id ? encodeId(user.fk_empresa_id) : null; // Codifica o id da empresa  

        res.status(200).json({
            message: 'Usuario excluido com sucesso!',
            user
        }); // Retorna usuario excluido
    } catch (err) {
        console.error('Erro ao excluir usuario:', err);
        res.status(500).send('Erro ao excluir usuario:');
    }
};

const updateUserController = async (req, res) => {
    const { id } = req.params;
    const { nome, email, tipo_usuario } = req.body;

    if (!id || !nome || !email || !tipo_usuario) {
        return res.status(400).send('ID, nome, email e tipo_usuario são obrigatórios para atualização');
    }

    let decodedId;
    try {
        decodedId = decodeId(id);
    } catch {
        return res.status(400).send('ID inválido');
    }

    try {
        const user = await updateUser(decodedId, nome, email, tipo_usuario);
        if (!user) {
            return res.status(404).send('Usuario não encontrado');
        }

        user.id_usuario = encodeId(user.id_usuario); // Codifica o id do usuario
        user.fk_empresa_id = user.fk_empresa_id ? encodeId(user.fk_empresa_id) : null; // Codifica o id da empresa

        res.status(200).json({
            message: 'Usuario atualizado com sucesso!',
            user
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Este e-mail já está cadastrado'
            });
        }
        console.error('Erro ao atualizar usuario:', err);
        res.status(500).send('Erro ao atualizar usuario');
    }
};

export {
    getUsersController,
    addUserController,
    deleteUserController,
    updateUserController,
    loginController,
    logoutController,
    checkAuthController,
    getUserNameController,
    updatePasswordController,
    refreshTokenController,
}