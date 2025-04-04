import client from '../config/database.js'; // Importando a conexão com o banco de dados
import bcrypt from 'bcrypt';


const getUserName = async (id) => {
    try {

        const result = await client.query(
            'SELECT nome FROM usuario WHERE id_usuario = $1',
            [id]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Erro ao buscar usuario:', err);
        throw err;
    }
};


const getUsuarioById = async (id) => {
    try {
        const result = await client.query(
            'SELECT id_usuario, fk_empresa_id FROM usuario WHERE id_usuario = $1',
            [id]
        );
        return result.rows[0] || null;
    } catch (err) {
        console.error('Erro ao buscar usuário por ID:', err);
        throw err;
    }
};

// Função para buscar um usuário por email
const getUserByEmail = async (email) => {
    try {
        const result = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);
        return result.rows[0]; // Retorna o usuário encontrado
    } catch (err) {
        console.error('Erro ao buscar usuário por email:', err);
        throw err;
    }
};

// Função para verificar a senha
const verifyPassword = async (senha, hashedSenha) => {
    return await bcrypt.compare(senha, hashedSenha);
};

// Função para pegar todos os usuarios ou um especifico
const getUsers = async ({ id, nome, email, senha, fk_empresa_id, tipo_usuario, page = 1, limit = 10, sortBy = 'id_usuario', order = 'ASC' } = {}) => {
    try {
        let query = 'SELECT * FROM usuario';
        const params = [];
        let conditions = [];

        // Filtros
        if (id) {
            conditions.push('id_usuario = $' + (params.length + 1));
            params.push(id);
        }
        if (nome) {
            conditions.push('nome ILIKE $' + (params.length + 1));
            params.push(`%${nome}%`);
        }
        if (email) {
            conditions.push('email ILIKE $' + (params.length + 1));
            params.push(`%${email}%`);
        }
        if (senha) {
            conditions.push('senha = $' + (params.length + 1));
            params.push(senha);
        }
        if (fk_empresa_id) {
            conditions.push('fk_empresa_id = $' + (params.length + 1));
            params.push(fk_empresa_id);
        }
        if (tipo_usuario) {
            conditions.push('tipo_usuario ILIKE $' + (params.length + 1));
            params.push(`%${tipo_usuario}%`);
        }

        // Adiciona condições à query, se houver
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Ordenação
        query += ` ORDER BY ${sortBy} ${order}`;

        // Paginação
        const offset = (page - 1) * limit;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await client.query(query, params);
        return result.rows;
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        throw err;
    }
};

// Função para adicionar um novo usuario
const saltRounds = 10;
const addUser = async (nome, email, senha, fk_empresa_id, tipo_usuario) => {
    try {
        const hashedSenha = await bcrypt.hash(senha, saltRounds);

        const result = await client.query(
            `INSERT INTO usuario 
            (nome, email, senha, fk_empresa_id, tipo_usuario) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id_usuario, nome, email, tipo_usuario`,
            [nome, email, hashedSenha, fk_empresa_id, tipo_usuario]
        );

        return result.rows[0];
    } catch (err) {
        // Adiciona o código de erro para tratamento no controller
        err.code = err.code || 'INTERNAL_ERROR';
        throw err;
    }
};

const deleteUser = async (id) => {
    try {
        const result = await client.query(
            'DELETE FROM usuario WHERE id_usuario = ($1) RETURNING *',
            [id]
        );
        return result.rows[0]; // Retorna a usuario deletada
    } catch (err) {
        console.error('Erro ao deletar usuario:', err);
        throw err;
    }
};


const updateUser = async (id, nome, email, tipo_usuario) => {
    try {
        const result = await client.query(
            'UPDATE usuario SET nome = $1, email = $2, tipo_usuario = $3 WHERE id_usuario = $4 RETURNING *',
            [nome, email, tipo_usuario, id]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Erro ao atualizar usuario:', err);
        throw err;
    }
};

export {
    getUsers,
    addUser,
    deleteUser,
    updateUser,
    getUserByEmail,
    verifyPassword,
    getUsuarioById,
    getUserName,
}
