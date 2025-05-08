import { getTimes, addTime, deleteTime, updateTime, getTimeById } from "../models/timeModel.js";
import { getScheduleById } from "../models/scheduleModel.js";
import Joi from 'joi';
import pool from "../config/database.js";

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
    const { horario, fk_usuario_id } = req.body;
    const usuarioAutenticado = req.user;


    if (!horario || !horario.fk_agenda_id) {
        return res.status(400).send('Dados obrigatórios ausentes');
    }

    try {
        const { rows } = await pool.query(`
            SELECT fk_empresa_id FROM usuario WHERE id_usuario = $1
        `, [fk_usuario_id]);

        if (rows.length === 0) return res.status(404).send('Usuário de destino não encontrado');
        const targetEmpresaId = rows[0].fk_empresa_id;
        const isAdmin = usuarioAutenticado.tipo_usuario === 'admin';
        const isManagerOrSecretary = ['gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario);
        const mesmoUsuario = usuarioAutenticado.id_usuario === fk_usuario_id;
        const mesmaEmpresa = usuarioAutenticado.fk_empresa_id === targetEmpresaId;

        const podeCriarHorario = isAdmin || mesmoUsuario || (isManagerOrSecretary && mesmaEmpresa);

        if (!podeCriarHorario) {
            return res.status(403).send('Você não tem permissão para criar horário para esse usuário');
        }

        // Aqui você chama sua função de criação
        const novoHorario = await addTime(horario); // ou como você tiver implementado
        return res.status(201).json(novoHorario);
    } catch (err) {
        console.error('Erro ao adicionar horário:', err);
        return res.status(500).send('Erro interno ao adicionar horário');
    }
};

// Controlador para adicionar um novo horario
const deleteTimeController = async (req, res) => {
    const { id } = req.params; // Recebe o ID do horário a ser deletado
    const usuarioAutenticado = req.user;
    console.log(usuarioAutenticado);

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
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Este horário já está cadastrada'
            });
        }
        res.status(500).send('Erro ao atualizar horário');
    }
};

export {
    getTimesController,
    addTimeController,
    deleteTimeController,
    updateTimeController,
}

