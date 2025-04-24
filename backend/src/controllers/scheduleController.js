import { getSchedules, addSchedule, deleteSchedule, updateSchedule, getScheduleById, getFkUserScheduleById } from "../models/scheduleModel.js";

import Joi from 'joi';

const searchSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    dataInicio: Joi.date().iso().optional(),
    dataFim: Joi.date().iso().optional(),
    fk_usuario_id: Joi.number().integer().positive().optional(),
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

        const fkUsuarioId = await getFkUserScheduleById(id);

        if (!fkUsuarioId) {
            return res.status(404).json({
                success: false,
                message: 'Agendamento não encontrado'
            });
        }

        res.json({
            success: true,
            fk_usuario_id: fkUsuarioId
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
        // Valida os parâmetros de busca
        const { error, value } = searchSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                message: 'Parâmetros de busca inválidos',
                error: error.details
            });
        }

        // O middleware já adicionou os filtros necessários
        const schedules = await getSchedules(value);

        res.status(200).json(schedules || []);
    } catch (err) {
        console.error('Erro no getSchedulesController:', err);
        res.status(500).json({
            message: 'Erro ao buscar agendas',
            error: err.message
        });
    }
};


// Controlador para adicionar um nova agenda
const addScheduleController = async (req, res) => {
    const { data, fk_usuario_id } = req.body; // Recebe os dados do corpo da requisição
    const usuarioAutenticado = req.user;

    if (!data || !fk_usuario_id) {
        return res.status(400).send('data e fk_usuario_id são obrigatórios');
    }
    try {
        if (usuarioAutenticado.id_usuario == fk_usuario_id || ['admin', 'gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario)) {
            const newSchedule = await addSchedule(data, fk_usuario_id);
            res.status(201).json(newSchedule);
        } else {
            res.status(403).send('Você não tem permissão para criar agendamentos para este usuário');
        }
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Esta agenda já está cadastrada'
            });
        }
        res.status(500).send('Erro ao adicionar agenda');
    }
};


// Controlador para adicionar um novo agenda
const deleteScheduleController = async (req, res) => {
    const { id } = req.body; // Recebe o ID do agendamento a ser deletado
    const usuarioAutenticado = req.user;

    if (!id) {
        return res.status(400).send('ID é obrigatório para exclusão');
    }

    try {
        // Busca o agendamento pelo ID
        const schedule = await getScheduleById(id);
        if (!schedule) {
            return res.status(404).send('Agenda não encontrada');
        }

        // Verifica se o usuário tem permissão para deletar o agendamento
        if (usuarioAutenticado.id_usuario === schedule.fk_usuario_id || ['admin', 'gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario)) {
            const deletedSchedule = await deleteSchedule(id);
            res.status(200).json({ message: 'Agenda excluída com sucesso!', schedule: deletedSchedule });
        } else {
            res.status(403).send('Você não tem permissão para excluir agendamentos para este usuário');
        }
    } catch (err) {
        console.error('Erro ao excluir agenda:', err);
        res.status(500).send('Erro ao excluir agenda');
    }
};


const updateScheduleController = async (req, res) => {
    const { id } = req.params;
    const { data, fk_usuario_id } = req.body;
    const usuarioAutenticado = req.user;

    if (!id || !data || !fk_usuario_id) {
        return res.status(400).send('ID, data e fk_usuario_id são obrigatórios para atualização');
    }

    try {
        if (usuarioAutenticado.id === fk_usuario_id || ['admin', 'gerente'].includes(usuarioAutenticado.tipo_usuario)) {
            const schedule = await updateSchedule(id, data, fk_usuario_id);
            if (!schedule) {
                return res.status(404).send('Agenda não encontrada');
            }
            res.status(200).json({ message: 'Agenda atualizado com sucesso!', schedule });
        } else {
            res.status(403).send('Você não tem permissão para editar agendamentos para este usuário');
        }
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Esta agenda já está cadastrada'
            });
        }
        res.status(500).send('Erro ao atualizar agenda');
    }
};

export {
    getSchedulesController,
    addScheduleController,
    deleteScheduleController,
    updateScheduleController,
}