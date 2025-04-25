import client from '../config/database.js'; // Importando a conexão com o banco de dados


export const getTimeById = async (id) => {
    try {
        const result = await client.query(
            'SELECT * FROM horario WHERE id_horario = $1',
            [id]
        );
        return result.rows[0] || null; // Retorna o horário ou null se não existir
    } catch (err) {
        console.error('Erro ao buscar horário por ID:', err);
        throw err;
    }
};

const getTimes = async ({ id, fk_agenda_id, horario, nome, contato, observacoes, agendadoPor, page = 1, limit = 10, sortBy = 'id_horario', order = 'ASC' } = {}) => {
    try {
        let query = 'SELECT * FROM horario';
        const params = [];
        let conditions = [];

        // Filtros
        if (id) {
            conditions.push('id_horario = $' + (params.length + 1));
            params.push(id);
        }
        if (fk_agenda_id) {
            conditions.push('fk_agenda_id = $' + (params.length + 1));
            params.push(fk_agenda_id);
        }
        if (horario) {
            conditions.push('horario = $' + (params.length + 1));
            params.push(horario);
        }
        if (nome) {
            conditions.push('nome ILIKE $' + (params.length + 1));
            params.push(`%${nome}%`);
        }
        if (contato) {
            conditions.push('contato ILIKE $' + (params.length + 1));
            params.push(`%${contato}%`);
        }
        if (observacoes) {
            conditions.push('observacoes ILIKE $' + (params.length + 1));
            params.push(`%${observacoes}%`);
        }
        if (agendadoPor) {
            conditions.push('agendadoPor ILIKE $' + (params.length + 1));
            params.push(`%${agendadoPor}%`);
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
        console.error('Erro ao buscar horários:', err);
        throw err;
    }
};

// Função para adicionar um novo horario
const addTime = async (fk_agenda_id, horario, nome, contato, observacoes, agendadoPor) => {
    try {
        const result = await client.query(
            'INSERT INTO horario (fk_agenda_id, horario, nome, contato, observacoes, agendadoPor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [fk_agenda_id, horario, nome, contato, observacoes, agendadoPor]
        );
        return result.rows[0]; // Retorna o horario recém-cadastrado
    } catch (err) {
        console.error('Erro ao adicionar horario:', err);
        throw err;
    }
};

const deleteTime = async (id) => {
    try {
        const result = await client.query(
            'DELETE FROM horario WHERE id_horario = ($1) RETURNING *',
            [id]
        );
        return result.rows[0]; // Retorna a horario deletada
    } catch (err) {
        console.error('Erro ao deletar horario:', err);
        throw err;
    }
};


const updateTime = async (id, fk_agenda_id, horario, nome, contato, observacoes, agendadoPor) => {
    try {
        const result = await client.query(
            'UPDATE horario SET fk_agenda_id = $1, horario = $2, nome = $3, contato = $4, observacoes =$5, agendadoPor =$6 WHERE id_horario = $7 RETURNING *',
            [fk_agenda_id, horario, nome, contato, observacoes, agendadoPor, id]
        );
        return result.rows[0]; // Retorna o horario atualizado
    } catch (err) {
        console.error('Erro ao atualizar horario:', err);
        throw err;
    }
};

export {
    getTimes,
    addTime,
    deleteTime,
    updateTime,
}
