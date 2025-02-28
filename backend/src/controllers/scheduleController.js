import { getSchedules, addSchedule, deleteSchedule, updateSchedule } from "../models/scheduleModel.js";

import Joi from 'joi';

const searchSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    data: Joi.date().iso().optional(),
    fk_usuario_id: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sortBy: Joi.string().valid('id_agenda', 'data', 'fk_usuario_id').default('id_agenda'),
    order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

const getSchedulesController = async (req, res) => {
    const { error, value } = searchSchema.validate(req.query);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const schedules = await getSchedules(value);

        if (schedules.length === 0) {
            return res.status(404).send('Nenhuma agenda encontrada');
        }

        res.status(200).json(schedules);
    } catch (err) {
        console.error('Erro ao buscar agendas:', err);
        res.status(500).send('Erro ao buscar agendas');
    }
};


// Controlador para adicionar um nova agenda
const addScheduleController = async (req, res) => {
    const { data, fk_usuario_id } = req.body; // Recebe os dados do corpo da requisição
    if (!data || !fk_usuario_id) {
        return res.status(400).send('data e fk_usuario_id são obrigatórios');
    }

    try {
        const newSchedule = await addSchedule(data, fk_usuario_id); // Chama o modelo para adicionar a agenda
        res.status(201).json(newSchedule); // Retorna a agenda criada
    } catch (err) {
        console.error('Erro ao adicionar agenda:', err);
        res.status(500).send('Erro ao adicionar agenda');
    }
};

// Controlador para adicionar um novo agenda
const deleteScheduleController = async (req, res) => {
    const { id } = req.body; // Recebe os dados do corpo da requisição
    if (!id) {
        return res.status(400).send('ID é obrigatório para exclusão');
    }

    try {
        const schedule = await deleteSchedule(id); // Chama o modelo para deletar o agenda
        if (!schedule) {
            return res.status(404).send('Empresa não encontrado');
        }
        res.status(200).json({ message: 'Empresa excluido com sucesso!', schedule }); // Retorna agenda excluido
    } catch (err) {
        console.error('Erro ao excluir agenda:', err);
        res.status(500).send('Erro ao excluir agenda:');
    }
};

const updateScheduleController = async (req, res) => {
    const { id } = req.params;
    const { data, fk_usuario_id } = req.body; // Recebe os dados do corpo da requisição
    if (!id || !data || !fk_usuario_id) {
        return res.status(400).send('ID, data e fk_usuario_id são obrigatório para atualização');
    }

    try {
        const schedule = await updateSchedule(id, data, fk_usuario_id); // Chama o modelo para atualizar o agenda
        if (!schedule) {
            return res.status(404).send('Empresa não encontrado');
        }
        res.status(200).json({ message: 'Empresa atualizado com sucesso!', schedule }); // Retorna agenda atualizado
    } catch (err) {
        console.error('Erro ao atualizar agenda:', err);
        res.status(500).send('Erro ao atualizar agenda:');
    }
};

export {
    getSchedulesController,
    addScheduleController,
    deleteScheduleController,
    updateScheduleController,
}

