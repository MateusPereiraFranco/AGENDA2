import pool from '../config/database.js'; // Importando a conexão com o banco de dados


export const getTimeById = async (id) => {
    try {
        const result = await pool.query(
            'SELECT * FROM horario WHERE id_horario = $1',
            [id]
        );
        return result.rows[0] || null; // Retorna o horário ou null se não existir
    } catch (err) {
        console.error('Erro ao buscar horário por ID:', err);
        throw err;
    }
};

const getTimes = async ({ id, fk_agenda_id, horario, nome, contato, observacoes, agendadoPor, valor_servico, periodo, page = 1, limit = 50, sortBy = 'id_horario', order = 'ASC' } = {}) => {
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
        if (valor_servico) {
            conditions.push('valor_servico ILIKE $' + (params.length + 1));
            params.push(`%${valor_servico}%`);
        }

        // ✅ Filtro de período (manhã/tarde)
        if (periodo === 'manha') {
            conditions.push('horario < $' + (params.length + 1));
            params.push('12:00:00');
        } else if (periodo === 'tarde') {
            conditions.push('horario >= $' + (params.length + 1));
            params.push('12:00:00');
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

        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        console.error('Erro ao buscar horários:', err);
        throw err;
    }
};

// Função para adicionar um novo horario
const addTime = async (horario) => {
    try {
        const result = await pool.query(
            'INSERT INTO horario (fk_agenda_id, horario, nome, contato, observacoes, agendadoPor, valor_servico) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [horario.fk_agenda_id, horario.horario, horario.nome, horario.contato, horario.observacoes, horario.agendadoPor, horario.valor_servico]
        );
        return result.rows[0]; // Retorna o horario recém-cadastrado
    } catch (err) {
        err.code = err.code || 'INTERNAL_ERROR';
        throw err;
    }
};

const deleteTime = async (id) => {
    try {
        const result = await pool.query(
            'DELETE FROM horario WHERE id_horario = ($1) RETURNING *',
            [id]
        );
        return result.rows[0]; // Retorna a horario deletada
    } catch (err) {
        console.error('Erro ao deletar horario:', err);
        throw err;
    }
};

const updateTime = async (id, nome, valor) => {
    try {
        const result = await pool.query(
            'UPDATE horario SET nome = $1, valor_servico = $2 WHERE id_horario = $3 RETURNING *',
            [nome, valor, id]
        );
        return result.rows[0]; // Retorna o horario atualizado
    } catch (err) {
        err.code = err.code || 'INTERNAL_ERROR';
        throw err;
    }
};

export {
    getTimes,
    addTime,
    deleteTime,
    updateTime,
}
