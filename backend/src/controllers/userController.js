import { getUsers, addUser, deleteUser, updateUser, getUserByEmail, verifyPassword } from "../models/userModel.js";
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
    sortBy: Joi.string().valid('id_usuario', 'nome', 'email').default('id_usuario'),
    order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

const loginController = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
        // Busca o usuário pelo email
        const user = await getUserByEmail(email);
        console.log(user) ////////////////////////////////////////
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Verifica a senha
        const senhaValida = await verifyPassword(senha, user.senha);
        console.log(senha)
        console.log(user.senha)
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Gera um token JWT
        const token = jwt.sign({ id: user.id_usuario, email: user.email }, 'secreto', { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        console.log("3")
        res.status(500).json({ message: 'Erro ao fazer login' });
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
    const { nome, email, senha, fk_empresa_id, tipo_usuario } = req.body; // Recebe os dados do corpo da requisição
    if (!nome || !email || !senha || !fk_empresa_id || !tipo_usuario) {
        return res.status(400).send('Nome, email, senha, empresa e tipo são obrigatórios');
    }

    try {
        const newUser = await addUser(nome, email, senha, fk_empresa_id, tipo_usuario); // Chama o modelo para adicionar a usuario
        res.status(201).json(newUser); // Retorna a usuario criada
    } catch (err) {
        console.error('Erro ao adicionar usuario:', err);
        res.status(500).send('Erro ao adicionar usuario');
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
    const { nome, email, senha, fk_empresa_id, tipo_usuario } = req.body; // Recebe os dados do corpo da requisição
    if (!id || !nome || !email || !senha || !fk_empresa_id || !tipo_usuario) {
        return res.status(400).send('ID, nome, email, senha, fk_empresa_id e tipo_usuario são obrigatório para atualização');
    }

    try {
        const user = await updateUser(id, nome, email, senha, fk_empresa_id, tipo_usuario); // Chama o modelo para atualizar o usuario
        if (!user) {
            return res.status(404).send('Usuario não encontrado');
        }
        res.status(200).json({ message: 'Usuario atualizado com sucesso!', user }); // Retorna usuario atualizado
    } catch (err) {
        console.error('Erro ao atualizar usuario:', err);
        res.status(500).send('Erro ao atualizar usuario:');
    }
};

export {
    getUsersController,
    addUserController,
    deleteUserController,
    updateUserController,
    loginController,
}

