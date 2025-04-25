import { getTimes, addTime, deleteTime, updateTime, getTimeById } from "../models/timeModel.js";
import { getScheduleById } from "../models/scheduleModel.js";
import Joi from 'joi';

const searchSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    fk_agenda_id: Joi.number().integer().positive().optional(),
    horario: Joi.string().optional(),
    nome: Joi.string().optional(),
    contato: Joi.string().optional(),
    observacoes: Joi.string().optional(),
    agendadoPor: Joi.string().optional(),
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sortBy: Joi.string().valid('id_horario', 'horario', 'nome').default('id_horario'),
    order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

const getTimesController = async (req, res) => {
    const { error, value } = searchSchema.validate(req.query);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const usuarioAutenticado = req.user; // Dados do usuário autenticado

    try {
        // Verifica se o usuário tem permissão para acessar os horários da agenda
        if (value.fk_agenda_id) {
            const agenda = await getScheduleById(value.fk_agenda_id); // Busca a agenda pelo ID
            if (!agenda) {
                return res.status(404).send('Agenda não encontrada');
            }

            // Verifica se o usuário é o dono da agenda ou tem permissão de admin/gerente/secretário
            if (usuarioAutenticado.id_usuario !== agenda.fk_usuario_id && !['admin', 'gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario)) {
                return res.status(403).send('Você não tem permissão para acessar os horários desta agenda');
            }
        }

        const times = await getTimes(value);

        if (times.length === 0) {
            return res.status(404).send('Nenhum horário encontrado');
        }

        res.status(200).json(times);
    } catch (err) {
        console.error('Erro ao buscar horários:', err);
        res.status(500).send('Erro ao buscar horários');
    }
};

// Controlador para adicionar um nova horario
const addTimeController = async (req, res) => {
    const { fk_agenda_id, horario, nome, contato, observacoes, agendadoPor } = req.body; // Recebe os dados do corpo da requisição
    if (!fk_agenda_id || !horario || !nome) {
        return res.status(400).send('Nome, fk_agenda_id e horario são obrigatórios');
    }

    try {
        const newTime = await addTime(fk_agenda_id, horario, nome, contato, observacoes, agendadoPor); // Chama o modelo para adicionar a horario
        res.status(201).json(newTime); // Retorna a horario criada
    } catch (err) {
        console.error('Erro ao adicionar horario:', err);
        res.status(500).send('Erro ao adicionar horario');
    }
};

// Controlador para adicionar um novo horario
const deleteTimeController = async (req, res) => {
    const { id } = req.body; // Recebe o ID do horário a ser deletado
    const usuarioAutenticado = req.user;

    if (!id) {
        return res.status(400).send('ID é obrigatório para exclusão');
    }

    try {
        // Busca o horário pelo ID
        const time = await getTimeById(id);
        if (!time) {
            return res.status(404).send('Horário não encontrado');
        }

        // Busca a agenda associada ao horário
        const agenda = await getScheduleById(time.fk_agenda_id);
        if (!agenda) {
            return res.status(404).send('Agenda não encontrada');
        }

        // Verifica se o usuário tem permissão para deletar o horário
        if (usuarioAutenticado.id_usuario === agenda.fk_usuario_id || ['admin', 'gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario)) {
            const deletedTime = await deleteTime(id);
            res.status(200).json({ message: 'Horário excluído com sucesso!', time: deletedTime });
        } else {
            res.status(403).send('Você não tem permissão para excluir horários desta agenda');
        }
    } catch (err) {
        console.error('Erro ao excluir horário:', err);
        res.status(500).send('Erro ao excluir horário');
    }
};


const updateTimeController = async (req, res) => {
    const { id } = req.params;
    const { fk_agenda_id, horario, nome, contato, observacoes, agendadoPor } = req.body; // Recebe os dados do corpo da requisição
    if (!id || !fk_agenda_id || !horario || !nome) {
        return res.status(400).send('ID, fk_agenda_id, horario, nome são obrigatório para atualização');
    }

    try {
        const time = await updateTime(id, fk_agenda_id, horario, nome, contato, observacoes, agendadoPor); // Chama o modelo para atualizar o horario
        if (!time) {
            return res.status(404).send('Horario não encontrado');
        }
        res.status(200).json({ message: 'Horario atualizado com sucesso!', time }); // Retorna horario atualizado
    } catch (err) {
        console.error('Erro ao atualizar horario:', err);
        res.status(500).send('Erro ao atualizar horario:');
    }
};

export {
    getTimesController,
    addTimeController,
    deleteTimeController,
    updateTimeController,
}

