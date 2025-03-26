import jwt from 'jsonwebtoken';
import { getUsuarioById } from '../models/userModel.js'
import { getUserByEmail } from '../models/userModel.js';

const autenticar = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    try {
        const decoded = jwt.verify(token, 'secreto');
        req.user = {
            id_usuario: decoded.id,
            email: decoded.email,
            tipo_usuario: decoded.tipo_usuario,
            fk_empresa_id: decoded.fk_empresa_id // Adicione esta linha
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
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

        } else if (req.method === 'DELETE' || req.method === 'PUT') {

            let idUser
            // Para UPDATE, verifica o params parameter
            if (req.params.id) {
                idUser = req.params.id
            }
            // Para DELETE, verifica o body parameter
            else if (req.body.id) {
                idUser = req.body.id
            }
            else {
                res.status(403).json({
                    message: 'Acesso negado. nenhum id passado.'
                });
            }
            const user = await getUsuarioById(idUser);
            targetCompanyId = user.fk_empresa_id
        }

        else {
            if (req.body && req.body.fk_empresa_id) {
                targetCompanyId = req.body.fk_empresa_id;
            }
        }

        const empresaIdUsuario = req.user.fk_empresa_id;

        if (targetCompanyId && empresaIdUsuario && targetCompanyId.toString() === empresaIdUsuario.toString()) {
            next(); // Permite acesso
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

const canAccessAgenda = async (req, res, next) => {
    try {
        const user = req.user;

        // Admin tem acesso irrestrito
        if (user.tipo_usuario === 'admin') {
            return next();
        }

        // Obter o ID do usuário alvo da agenda
        let targetUserId;

        // Verifica todas as possíveis fontes

        if (req.query.fk_usuario_id) {
            targetUserId = req.query.fk_usuario_id;
        } else {
            return null
        }

        // Se o usuário alvo for ele mesmo, permite
        if (targetUserId == user.id_usuario) {
            return next();
        }

        // Para gerentes/secretários, verifica se é da mesma empresa
        if (['gerente', 'secretario'].includes(user.tipo_usuario)) {
            const targetUser = await getUsuarioById(targetUserId);

            if (!targetUser) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            if (targetUser.fk_empresa_id == user.fk_empresa_id) {
                return next();
            }
        }

        // Se for funcionário tentando acessar outra agenda
        if (user.tipo_usuario === 'funcionario') {
            return res.status(403).json({
                message: 'Acesso negado. Você só pode acessar sua própria agenda.'
            });
        }

        // Se nenhuma das condições acima for atendida
        return res.status(403).json({
            message: 'Acesso negado. Você não tem permissão para acessar esta agenda.'
        });

    } catch (error) {
        console.error('Erro no middleware canAccessAgenda:', error);
        return res.status(500).json({ message: 'Erro ao verificar permissões' });
    }
};

export { autenticar, isAdminOrManager, canAccessAgenda };