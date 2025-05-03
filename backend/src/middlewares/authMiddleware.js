import jwt from 'jsonwebtoken';
import { getUsuarioById } from '../models/userModel.js'


const autenticar = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) return res.status(401).json({ message: 'Não autenticado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token expirado. Use refresh token.' });
    }
};


const isAdminOrManager = async (req, res, next) => {
    const allowedRoles = ['admin', 'gerente', 'secretario'];

    if (allowedRoles.includes(req.user.tipo_usuario)) {
        // Se for admin, permite acesso sem restrição de empresa
        if (req.user.tipo_usuario === 'admin') {
            return next();
        }

        let targetCompanyId;

        // Verifica em diferentes lugares dependendo do método HTTP
        if (req.method === 'GET') {
            // Para GET, verifica o query parameter
            if (req.query.fk_empresa_id) {
                targetCompanyId = req.query.fk_empresa_id;
            }

        } else if (req.user.tipo_usuario === 'gerente') {
            if (req.method === 'DELETE' || req.method === 'PUT') {

                let idUser
                // Para UPDATE, verifica o params
                if (req.params.id) {
                    idUser = req.params.id
                }
                // Para DELETE, verifica o body
                else if (req.body.id) {
                    idUser = req.body.id
                }
                else {
                    return res.status(403).json({
                        message: 'Acesso negado. nenhum id passado.'
                    });
                }
                const user = await getUsuarioById(idUser);
                if (!user) {
                    return res.status(404).json({ message: 'Usuário não encontrado' });
                }
                targetCompanyId = user.fk_empresa_id
            }
            else {
                if (req.body && req.body.fk_empresa_id) {
                    targetCompanyId = req.body.fk_empresa_id;
                }
            }

        } else {
            return res.status(403).json({
                message: 'Acesso negado. Apenas gerente pode deletar, adicionar e atualizar.'
            });
        }

        const empresaIdUsuario = req.user.fk_empresa_id;

        if (targetCompanyId && empresaIdUsuario && targetCompanyId.toString() === empresaIdUsuario.toString()) {
            next();
        } else {
            res.status(403).json({
                message: 'Acesso negado. Você só pode acessar dados da sua própria empresa.'
            });
        }
    } else {
        res.status(403).json({
            message: 'Acesso negado. Somente administradores, gerentes ou secretários podem acessar esta rota.'
        });
    }
};

import pool from '../config/database.js';

export const checkAcesso = (tipoRecurso) => {
    return async (req, res, next) => {
        const { id: userId, tipo_usuario, fk_empresa_id } = req.user;
        let targetUserId = null;

        try {
            if (tipo_usuario === 'admin') return next(); // acesso total

            switch (tipoRecurso) {
                case 'agenda': {
                    const inputUserId = req.query.fk_usuario_id || req.body.fk_usuario_id || req.params.id;
                    console.log(req.query, req.body, req.params)
                    if (!inputUserId) {
                        return res.status(400).json({ message: 'ID do usuário não fornecido para agenda' });
                    }

                    const { rows } = await pool.query(
                        'SELECT id_usuario, fk_empresa_id FROM usuario WHERE id_usuario = $1',
                        [inputUserId]
                    );

                    if (rows.length === 0) return res.status(404).json({ message: 'Usuário da agenda não encontrado' });

                    targetUserId = rows[0].id;
                    const targetEmpresaId = rows[0].fk_empresa_id;

                    if ((tipo_usuario === 'gerente' || tipo_usuario === 'secretario') && targetEmpresaId === fk_empresa_id) return next();
                    if (tipo_usuario === 'funcionario' && parseInt(inputUserId) === userId) return next();

                    break;
                }

                case 'horario': {
                    const horarioId = req.params.id || req.body.horarioId || req.query.horarioId;
                    if (!horarioId) return res.status(400).json({ message: 'ID do horário não fornecido' });

                    const { rows } = await pool.query(`
                        SELECT u.id_usuario AS usuario_id, u.fk_empresa_id
                        FROM horario h
                        JOIN agenda a ON h.fk_agenda_id = a.id_agenda
                        JOIN usuario u ON a.fk_usuario_id = u.id_usuario
                        WHERE h.id_horario = $1
                    `, [horarioId]);

                    if (rows.length === 0) return res.status(404).json({ message: 'Horário não encontrado' });

                    const { usuario_id, fk_empresa_id: targetEmpresaId } = rows[0];

                    if ((tipo_usuario === 'gerente' || tipo_usuario === 'secretario') && targetEmpresaId === fk_empresa_id) return next();
                    if (tipo_usuario === 'funcionario' && usuario_id === userId) return next();

                    break;
                }

                default:
                    return res.status(400).json({ message: 'Tipo de recurso inválido para verificação de acesso' });
            }

            return res.status(403).json({ message: 'Acesso não autorizado' });

        } catch (err) {
            console.error(`Erro no middleware checkAcesso(${tipoRecurso}):`, err);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
    };
};


export { autenticar, isAdminOrManager };