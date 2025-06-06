import pool from '../config/database.js'; // Importando a conexão com o banco de dados

// Função para buscar um agendamento pelo ID
const getScheduleById = async (id) => {
    try {
        const result = await pool.query(
            'SELECT id_agenda, TO_CHAR(data, \'DD/MM/YYYY\') as data, fk_usuario_id FROM agenda WHERE id_agenda = $1',
            [id]
        );
        return result.rows[0] || null; // Retorna o agendamento ou null se não existir
    } catch (err) {
        console.error('Erro ao buscar agendamento por ID:', err);
        throw err;
    }
};

const getFkUserScheduleById = async (id) => {
    try {
        const result = await pool.query(
            'SELECT fk_usuario_id FROM agenda WHERE id_agenda = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].fk_usuario_id;
    } catch (err) {
        console.error('Erro no model ao buscar fk_usuario_id:', err);
        throw err; // Propaga o erro para ser tratado no controller
    }
};

const getDataAgendamento = async (id) => {
    try {
        const result = await pool.query(
            'SELECT TO_CHAR(data, \'DD/MM/YYYY\') as data FROM agenda WHERE id_agenda = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].data;
    } catch (err) {
        console.error('Erro no model ao buscar data:', err);
        throw err; // Propaga o erro para ser tratado no controller
    }
};


const getSchedules = async ({
    id,
    dataInicio,
    dataFim,
    fk_usuario_id,
    page = 1,
    limit = 10,
    sortBy = 'id_agenda',
    order = 'ASC'
} = {}) => {
    try {
        let query = `
        SELECT 
          id_agenda, 
          TO_CHAR(data, 'DD/MM/YYYY') as data, 
          data as data_original, 
          fk_usuario_id,
          (SELECT COUNT(id_horario) FROM horario WHERE fk_agenda_id = agenda.id_agenda) as total_horarios,
          (SELECT COALESCE(SUM(valor_servico), 0) FROM horario WHERE fk_agenda_id = agenda.id_agenda) as total_valores
        FROM agenda
      `;

        const params = [];
        const conditions = [];

        if (id) {
            conditions.push(`id_agenda = $${params.length + 1}`);
            params.push(id);
        }

        if (dataInicio && dataFim) {
            conditions.push(`DATE(data) BETWEEN DATE($${params.length + 1}) AND DATE($${params.length + 2})`);
            params.push(dataInicio, dataFim);
        } else if (dataInicio) {
            conditions.push(`DATE(data) >= DATE($${params.length + 1})`);
            params.push(dataInicio);
        } else if (dataFim) {
            conditions.push(`DATE(data) <= DATE($${params.length + 1})`);
            params.push(dataFim);
        }

        if (fk_usuario_id) {
            conditions.push(`fk_usuario_id = $${params.length + 1}`);
            params.push(fk_usuario_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const orderByField = sortBy === 'data' ? 'data_original' : sortBy;
        query += ` ORDER BY ${orderByField} ${order}`;

        const offset = (page - 1) * limit;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        console.error('Erro ao buscar agendas:', err);
        throw err;
    }
};


// Função para adicionar um nova agenda
const addSchedule = async (data, fk_usuario_id) => {
    try {
        const result = await pool.query(
            'INSERT INTO agenda (data, fk_usuario_id) VALUES ($1, $2) RETURNING *',
            [data, fk_usuario_id]
        );
        return result.rows[0]; // Retorna o agenda recém-cadastrado
    } catch (err) {
        err.code = err.code || 'INTERNAL_ERROR';
        throw err;
    }
};

const deleteSchedule = async (id) => {
    try {
        const result = await pool.query(
            'DELETE FROM agenda WHERE id_agenda = ($1) RETURNING *',
            [id]
        );
        return result.rows[0]; // Retorna a agenda deletada
    } catch (err) {
        console.error('Erro ao deletar agenda:', err);
        throw err;
    }
};


const updateSchedule = async (id, data) => {
    try {
        const result = await pool.query(
            'UPDATE agenda SET data = $1 WHERE id_agenda = $2 RETURNING *',
            [data, id]
        );
        return result.rows[0]; // Retorna o agenda atualizado
    } catch (err) {
        err.code = err.code || 'INTERNAL_ERROR';
        throw err;
    }
};

export {
    getSchedules,
    addSchedule,
    deleteSchedule,
    updateSchedule,
    getScheduleById,
    getFkUserScheduleById,
    getDataAgendamento,
}
