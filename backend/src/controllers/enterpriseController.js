import { addEnterprise, deleteEnterprise, getEnterprises, updateEnterprise, getEnterpriseName } from "../models/enterpriseModel.js";

import Joi from 'joi';

const searchSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    nome: Joi.string().optional(),
    cnpj: Joi.string().optional(),
    telefone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sortBy: Joi.string().valid('id_empresa', 'nome', 'cnpj').default('id_empresa'),
    order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

const getEnterprisesController = async (req, res) => {
    const { error, value } = searchSchema.validate(req.query);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const enterprises = await getEnterprises(value);

        if (enterprises.length === 0) {
            return res.status(404).send('Nenhuma empresa encontrada');
        }

        res.status(200).json(enterprises);
    } catch (err) {
        console.error('Erro ao buscar empresas:', err);
        res.status(500).send('Erro ao buscar empresas');
    }
};

const addEnterpriseController = async (req, res) => {
    const { nome, cnpj, telefone, email } = req.body;

    if (!nome || !email) {
        return res.status(400).send('Nome e e-mail são obrigatórios');
    }

    try {
        const newEnterprise = await addEnterprise(nome, cnpj, telefone, email);
        res.status(201).json(newEnterprise);

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Este CNPJ já está cadastrado'
            });
        }

        res.status(500).json({
            error: 'Erro ao cadastrar empresa'
        });
    }
};

const deleteEnterpriseController = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).send('ID é obrigatório para exclusão');
    }

    try {
        const enterprise = await deleteEnterprise(id);

        if (!enterprise) {
            return res.status(404).send('Empresa não encontrada');
        }

        res.status(200).json({ message: 'Empresa excluída com sucesso!', enterprise });
    } catch (err) {
        console.error('Erro ao excluir empresa:', err);
        res.status(500).send('Erro ao excluir empresa');
    }
};

const updateEnterpriseController = async (req, res) => {
    const { id } = req.params;
    const { nome, cnpj, telefone, email } = req.body;

    if (!id || !nome || !email) {
        return res.status(400).send('ID, nome e email são obrigatórios para atualização');
    }

    try {
        const enterprise = await updateEnterprise(id, nome, cnpj, telefone, email);

        if (!enterprise) {
            return res.status(404).send('Empresa não encontrada');
        }

        res.status(200).json({ message: 'Empresa atualizada com sucesso!', enterprise });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Este CNPJ já está cadastrado'
            });
        }
        console.error('Erro ao atualizar empresa:', err);
        res.status(500).send('Erro ao atualizar empresa');
    }
};


const getEnterpriseNameController = async (req, res) => {
    const { id } = req.query;

    try {
        const enterpriseName = await getEnterpriseName(id);

        if (!enterpriseName) {
            return res.status(404).send('Nenhuma empresa encontrada');
        }

        res.status(200).json(enterpriseName);
    } catch (err) {
        console.error('Erro ao buscar nome da empresa:', err);
        res.status(500).send('Erro ao buscar nome da empresa');
    }
};

export {
    getEnterprisesController,
    addEnterpriseController,
    deleteEnterpriseController,
    updateEnterpriseController,
    getEnterpriseNameController
};