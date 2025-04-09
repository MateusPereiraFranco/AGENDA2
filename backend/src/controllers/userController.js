import { getUsers, addUser, deleteUser, updateUser, getUserByEmail, verifyPassword, getUserName } from "../models/userModel.js";
import jwt from 'jsonwebtoken';

import Joi from 'joi';

const searchSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    nome: Joi.string().optional(),
    email: Joi.string().email().optional(),
    senha: Joi.string().optional(),
    fk_empresa_id: Joi.number().integer().positive().optional(),
    tipo_usuario: Joi.string().optional(),
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sortBy: Joi.string().default('id_usuario'),
    order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

const checkAuthController = async (req, res) => {
    // Extrai o token do cookie
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ authenticated: false, message: 'Token não fornecido' });
    }

    try {
        // Verifica o token usando a chave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use a mesma chave usada no login

        // Retorna as informações do usuário e o status de autenticação
        res.status(200).json({
            authenticated: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                tipo_usuario: decoded.tipo_usuario,
            },
        });
    } catch (err) {
        // Se o token for inválido ou expirado
        console.error('Erro ao verificar token:', err);
        res.status(401).json({ authenticated: false, message: 'Token inválido ou expirado' });
    }
};

const loginController = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
        // Busca o usuário pelo email
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Verifica a senha
        const senhaValida = await verifyPassword(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Gera um token JWT
        const token = jwt.sign(
            { id: user.id_usuario, email: user.email, tipo_usuario: user.tipo_usuario, fk_empresa_id: user.fk_empresa_id },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );


        // Configura o cookie seguro
        res.cookie('token', token, {
            httpOnly: true, // Impede acesso via JavaScript
            secure: process.env.NODE_ENV === 'production', // Só envia o cookie em HTTPS em produção
            sameSite: 'strict', // Protege contra ataques CSRF
            maxAge: 10800000, // Expira em 3 hora (em milissegundos)
        });

        // Retorna uma resposta de sucesso sem o token no corpo
        res.status(200).json({ message: 'Login bem-sucedido', user: { id: user.id_usuario, email: user.email } });

    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};


const logoutController = (req, res) => {
    res.clearCookie('token'); // Remove o cookie
    res.status(200).json({ message: 'Logout bem-sucedido' });
};


const getUserNameController = async (req, res) => {
    const { id } = req.query;

    try {
        const userName = await getUserName(id);

        if (!userName) {
            return res.status(404).send('Nenhum usuário encontrada');
        }

        res.status(200).json(userName);
    } catch (err) {
        console.error('Erro ao buscar nome do usuario:', err);
        res.status(500).send('Erro ao buscar nome do usuario');
    }
};

const getUserByEmailController = async (req, res) => {
    try {
        const { email } = req.query; // Mude de req.body para req.query

        const usuario = await getUserByEmail(email);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Retorne TODOS os dados do usuário no mesmo formato que seu frontend espera
        res.status(200).json({
            success: true,
            data: usuario // Retorna o objeto completo
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erro no servidor'
        });
    }
};

const getUsersController = async (req, res) => {
    const { error, value } = searchSchema.validate(req.query);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const users = await getUsers(value);

        if (users.length === 0) {
            return res.status(404).send('Nenhum usuário encontrado');
        }

        res.status(200).json(users);
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

    try {
        const newUser = await addUser(nome, email, senha, fk_empresa_id, tipo_usuario);
        res.status(201).json({
            success: true,
            data: newUser
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
    const { id } = req.body; // Recebe os dados do corpo da requisição
    if (!id) {
        return res.status(400).send('ID é obrigatório para exclusão');
    }

    try {
        const user = await deleteUser(id); // Chama o modelo para deletar o usuario
        if (!user) {
            return res.status(404).send('Usuario não encontrado');
        }
        res.status(200).json({ message: 'Usuario excluido com sucesso!', user }); // Retorna usuario excluido
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

    try {
        const user = await updateUser(id, nome, email, tipo_usuario);
        if (!user) {
            return res.status(404).send('Usuario não encontrado');
        }
        res.status(200).json({ message: 'Usuario atualizado com sucesso!', user });
    } catch (err) {
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
    getUserByEmailController,
    getUserNameController,
}