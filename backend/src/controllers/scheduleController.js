import pool from "../config/database.js";
import { getSchedules, addSchedule, deleteSchedule, updateSchedule, getScheduleById, getFkUserScheduleById, getDataAgendamento } from "../models/scheduleModel.js";

import Joi from 'joi';
import { encodeId, decodeId } from "../utils/hashids.js";

const searchSchema = Joi.object({
    id: Joi.string().optional(),
    dataInicio: Joi.date().iso().optional(),
    dataFim: Joi.date().iso().optional(),
    fk_usuario_id: Joi.string().optional(),
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sortBy: Joi.string().valid('id_agenda', 'data', 'fk_usuario_id').default('id_agenda'),
    order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

export const getFkUserScheduleByIdController = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID do agendamento é obrigatório'
            });
        }

        let decodedId;
        try {
            decodedId = decodeId(id);
        } catch {
            return res.status(400).send('ID inválido');
        }

        const fkUsuarioId = await getFkUserScheduleById(decodedId);

        if (!fkUsuarioId) {
            return res.status(404).json({
                success: false,
                message: 'Agendamento não encontrado'
            });
        }

        res.json({
            success: true,
            fk_usuario_id: encodeId(fkUsuarioId)
        });
    } catch (err) {
        console.error('Erro no controller ao buscar agendamento:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const getDataAgendamentoController = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID do agendamento é obrigatório'
            });
        }

        let decodedId;
        try {
            decodedId = decodeId(id);
        } catch {
            return res.status(400).send('ID inválido');
        }

        const data = await getDataAgendamento(decodedId);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Agendamento não encontrado'
            });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        console.error('Erro no controller ao buscar agendamento:', err);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getSchedulesController = async (req, res) => {
    try {
        const { error, value } = searchSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                message: 'Parâmetros de busca inválidos',
                error: error.details
            });
        }

        const loggedUser = req.user;
        let agendaUserId = value.fk_usuario_id;

        if (!agendaUserId) {
            return res.status(400).json({ message: 'ID do usuário da agenda é obrigatório' });
        } else {
            try {
                agendaUserId = decodeId(agendaUserId);
            } catch {
                return res.status(400).json({ message: 'ID do usuario inválido' });
            }
        }

        if (!loggedUser.id || !loggedUser.fk_empresa_id || !loggedUser.tipo_usuario) {
            return res.status(401).json({ message: 'Dados do usuário autenticado estão incompletos' });
        }

        // 2. Obtenha info do dono da agenda
        const agendaUserResult = await pool.query(
            'SELECT id_usuario, fk_empresa_id FROM usuario WHERE id_usuario = $1',
            [agendaUserId]
        );

        const agendaUser = agendaUserResult.rows[0];

        if (!agendaUser) return res.status(404).json({ message: 'Usuário da agenda não encontrado' });

        // 3. Regras de permissão
        const mesmaEmpresa = loggedUser.fk_empresa_id === agendaUser.fk_empresa_id;
        const isGerenteOuSecretario = ['gerente', 'secretario'].includes(loggedUser.tipo_usuario);
        const isProprioUsuario = loggedUser.id === agendaUser.id_usuario;

        const podeVer = (mesmaEmpresa && isGerenteOuSecretario) || isProprioUsuario || loggedUser.tipo_usuario === 'admin';

        if (!podeVer) {
            return res.status(403).json({ message: 'Você não tem permissão para visualizar essa agenda' });
        }

        // 4. Buscar agendas
        const schedules = await getSchedules({ ...value, fk_usuario_id: agendaUserId });

        const response = schedules.map(schedule => ({
            ...schedule,
            id_agenda: encodeId(schedule.id_agenda),
            fk_usuario_id: schedule.fk_usuario_id ? encodeId(schedule.fk_usuario_id) : null,
        }));

        return res.status(200).json(response || []);
    } catch (err) {
        console.error('Erro no getSchedulesController:', err);
        return res.status(500).json({
            message: 'Erro ao buscar agendas',
            error: err.message
        });
    }
};


// Controlador para adicionar um nova agenda
const addScheduleController = async (req, res) => {
    const { data } = req.body;
    const { fk_usuario_id } = req.body;

    let fk_usuario_id_decoded;

    try {
        fk_usuario_id_decoded = decodeId(fk_usuario_id);
    } catch {
        return res.status(400).json({ error: 'ID da empresa inválido' });
    }

    const usuarioAutenticado = req.user;

    if (!data) {
        return res.status(400).send('A data é obrigatória');
    }

    const isAdmin = usuarioAutenticado.tipo_usuario === 'admin';
    const isManagerOrSecretary = ['gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario);
    const mesmoUsuario = usuarioAutenticado.id == fk_usuario_id_decoded;

    try {
        if (!mesmoUsuario && !isAdmin) {

            const { rows } = await pool.query(`
                SELECT fk_empresa_id FROM usuario WHERE id_usuario = $1
            `, [fk_usuario_id_decoded]);

            if (rows.length === 0) return res.status(404).send('Usuário de destino não encontrado');

            const targetEmpresaId = rows[0].fk_empresa_id;
            const mesmaEmpresa = usuarioAutenticado.fk_empresa_id === targetEmpresaId;

            const podeCriarAgenda = (isManagerOrSecretary && mesmaEmpresa);

            if (!podeCriarAgenda) {
                return res.status(403).send('Você não tem permissão para criar agendamentos para outros usuários');
            }
        }

        const newSchedule = await addSchedule(data, fk_usuario_id_decoded);
        return res.status(201).json({
            success: true,
            data: {
                ...newSchedule,
                id_agenda: encodeId(newSchedule.id_agenda),
                fk_usuario_id: newSchedule.fk_usuario_id ? encodeId(newSchedule.fk_usuario_id) : null
            }
        });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Esta agenda já está cadastrada' });
        }
        console.error('Erro ao adicionar agenda:', err);
        return res.status(500).send('Erro interno ao adicionar agenda');
    }
};



// Controlador para adicionar um novo agenda
// middleware checkAcesso('agenda') já verifica se o usuário tem permissão para deletar a agenda
const deleteScheduleController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send('ID do agendamento é obrigatório para exclusão');
    }

    let decodedId;
    try {
        decodedId = decodeId(id);
    } catch {
        return res.status(400).send('ID inválido');
    }

    try {
        const deleted = await deleteSchedule(decodedId);
        if (!deleted) {
            return res.status(404).send('Agendamento não encontrado');
        }
        deleted.id_agenda = encodeId(deleted.id_agenda); // Codifica o id do usuario
        deleted.fk_usuario_id = deleted.fk_usuario_id ? encodeId(deleted.fk_usuario_id) : null;

        return res.status(200).json({ message: 'Agendamento excluído com sucesso', schedule: deleted });

    } catch (err) {
        console.error('Erro ao excluir agendamento:', err);
        return res.status(500).send('Erro interno ao tentar excluir agendamento');
    }
};


// middleware checkAcesso('agenda') já verifica se o usuário tem permissão para atualizar a agenda
const updateScheduleController = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    if (!id || !data) {
        return res.status(400).send('ID e data são obrigatórios para atualização');
    }

    let decodedId;
    try {
        decodedId = decodeId(id);
    } catch {
        return res.status(400).send('ID inválido');
    }

    try {
        const updatedSchedule = await updateSchedule(decodedId, data);
        if (!updatedSchedule) {
            return res.status(404).send('Agendamento não encontrado');
        }
        updatedSchedule.id_agenda = encodeId(updatedSchedule.id_agenda); // Codifica o id do usuario
        updatedSchedule.fk_usuario_id = updatedSchedule.fk_usuario_id ? encodeId(updatedSchedule.fk_usuario_id) : null;
        return res.status(200).json({ message: 'Agenda atualizada com sucesso!', schedule: updatedSchedule });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Esta agenda já está cadastrada' });
        }
        console.error('Erro ao atualizar agenda:', err);
        return res.status(500).send('Erro interno ao atualizar agenda');
    }
};

export {
    getSchedulesController,
    addScheduleController,
    deleteScheduleController,
    updateScheduleController,
}