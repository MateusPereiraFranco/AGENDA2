import { getTimes, addTime, deleteTime, updateTime, getTimeById } from "../models/timeModel.js";
import { getScheduleById } from "../models/scheduleModel.js";
import Joi from 'joi';
import pool from "../config/database.js";
import { encodeId, decodeId } from "../utils/hashids.js";

const searchSchema = Joi.object({
    id: Joi.string().optional(),
    fk_agenda_id: Joi.string().optional(),
    horario: Joi.string().optional(),
    nome: Joi.string().optional(),
    contato: Joi.string().optional(),
    observacoes: Joi.string().optional(),
    agendadoPor: Joi.string().optional(),
    valor_servico: Joi.number().precision(2).min(0),
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

    if (value.fk_agenda_id) {
        try {
            value.fk_agenda_id = decodeId(value.fk_agenda_id);
        } catch {
            return res.status(400).send('ID da empresa inválido');
        }
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
            if (usuarioAutenticado.id !== agenda.fk_usuario_id && !['admin', 'gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario)) {
                return res.status(403).send('Você não tem permissão para acessar os horários desta agenda');
            }
        }

        const times = await getTimes(value);

        const response = times.map(time => ({
            ...time,
            id_horario: encodeId(time.id_horario),
            fk_agenda_id: time.fk_agenda_id ? encodeId(time.fk_agenda_id) : null,
        }));

        return res.status(200).json(response || []);

    } catch (err) {
        console.error('Erro ao buscar horários:', err);
        res.status(500).send('Erro ao buscar horários');
    }
};

// Controlador para adicionar um nova horario
const addTimeController = async (req, res) => {
    const { horario, fk_usuario_id } = req.body;
    const usuarioAutenticado = req.user;

    if (!fk_usuario_id) {
        return res.status(400).send('Dados obrigatórios ausentes');
    }
    if (!horario || !horario.fk_agenda_id) {
        return res.status(400).send('Dados obrigatórios ausentes');
    }


    let fk_usuario_id_decoded;
    try {
        fk_usuario_id_decoded = decodeId(fk_usuario_id);
        horario.fk_agenda_id = decodeId(horario.fk_agenda_id);
    } catch {
        return res.status(400).json({ error: 'ID da empresa inválido' });
    }

    try {
        const { rows } = await pool.query(`
            SELECT fk_empresa_id FROM usuario WHERE id_usuario = $1
        `, [fk_usuario_id_decoded]);

        if (rows.length === 0) return res.status(404).send('Usuário de destino não encontrado');
        const targetEmpresaId = rows[0].fk_empresa_id;
        const isAdmin = usuarioAutenticado.tipo_usuario === 'admin';
        const isManagerOrSecretary = ['gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario);
        const mesmoUsuario = usuarioAutenticado.id === fk_usuario_id_decoded;
        const mesmaEmpresa = usuarioAutenticado.fk_empresa_id === targetEmpresaId;

        const podeCriarHorario = isAdmin || mesmoUsuario || (isManagerOrSecretary && mesmaEmpresa);

        if (!podeCriarHorario) {
            return res.status(403).send('Você não tem permissão para criar horário para esse usuário');
        }


        // Aqui você chama sua função de criação
        const novoHorario = await addTime(horario);

        return res.status(201).json({
            success: true,
            data: {
                ...novoHorario,
                id_agenda: encodeId(novoHorario.id_horario),
                fk_agenda_id: novoHorario.fk_agenda_id ? encodeId(novoHorario.fk_agenda_id) : null
            }
        });

    } catch (err) {
        console.error('Erro ao adicionar horário:', err);
        return res.status(500).send('Erro interno ao adicionar horário');
    }
};

// Controlador para adicionar um novo horario
const deleteTimeController = async (req, res) => {
    const { id } = req.params; // Recebe o ID do horário a ser deletado
    const usuarioAutenticado = req.user;

    if (!id) {
        return res.status(400).send('ID é obrigatório para exclusão');
    }

    let decodedId;
    try {
        decodedId = decodeId(id);
    } catch {
        return res.status(400).send('ID inválido');
    }

    try {
        // Busca o horário pelo ID
        const time = await getTimeById(decodedId);

        if (!time) {
            return res.status(404).send('Horário não encontrado');
        }

        // Busca a agenda associada ao horário
        const agenda = await getScheduleById(time.fk_agenda_id);
        if (!agenda) {
            return res.status(404).send('Agenda não encontrada');
        }

        // Verifica se o usuário tem permissão para deletar o horário
        if (usuarioAutenticado.id === agenda.fk_usuario_id || ['admin', 'gerente', 'secretario'].includes(usuarioAutenticado.tipo_usuario)) {
            const deletedTime = await deleteTime(decodedId);
            //deletedTime.id_horario = encodeId(deletedTime.id_horario); // Codifica o id do usuario
            //deletedTime.fk_agenda_id = deletedTime.fk_agenda_id ? encodeId(deletedTime.fk_agenda_id) : null;

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
    const { fk_agenda_id, horario, nome, contato, observacoes, agendadoPor, valor_servico } = req.body; // Recebe os dados do corpo da requisição
    if (!id || !fk_agenda_id || !horario || !nome) {
        return res.status(400).send('ID, fk_agenda_id, horario, nome são obrigatório para atualização');
    }

    try {
        const time = await updateTime(id, fk_agenda_id, horario, nome, contato, observacoes, agendadoPor, valor_servico); // Chama o modelo para atualizar o horario
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

