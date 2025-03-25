import jwt from 'jsonwebtoken';
import { getUsuarioById } from '../models/userModel.js'

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

const isAdminOrManager = (req, res, next) => {
    const allowedRoles = ['admin', 'gerente', 'secretario'];

    if (allowedRoles.includes(req.user.tipo_usuario)) {
        // Se for admin, permite acesso sem restrição de empresa
        if (req.user.tipo_usuario === 'admin') {
            return next();
        }

        // Para gerente ou secretário, verifica se a empresa da query é a mesma do usuário
        const empresaIdQuery = req.query.fk_empresa_id; // Agora pegando da query string
        const empresaIdUsuario = req.user.fk_empresa_id;

        if (empresaIdQuery && empresaIdUsuario && empresaIdQuery.toString() === empresaIdUsuario.toString()) {
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

        // 1. Admin tem acesso irrestrito
        if (user.tipo_usuario === 'admin') {
            return next();
        }

        // 2. Obter o ID do usuário alvo da agenda
        let targetUserId;

        // Verifica todas as possíveis fontes

        if (req.query.fk_usuario_id) {
            targetUserId = req.query.fk_usuario_id;
        }


        // 4. Se o usuário alvo for ele mesmo, permite
        if (targetUserId == user.id_usuario) {
            return next();
        }

        // 5. Para gerentes/secretários, verifica se é da mesma empresa
        if (['gerente', 'secretario'].includes(user.tipo_usuario)) {
            const targetUser = await getUsuarioById(targetUserId);

            if (!targetUser) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            if (targetUser.fk_empresa_id == user.fk_empresa_id) {
                return next();
            }
        }

        // 6. Se for funcionário tentando acessar outra agenda
        if (user.tipo_usuario === 'funcionario') {
            return res.status(403).json({
                message: 'Acesso negado. Você só pode acessar sua própria agenda.'
            });
        }

        // 7. Se nenhuma das condições acima for atendida
        return res.status(403).json({
            message: 'Acesso negado. Você não tem permissão para acessar esta agenda.'
        });

    } catch (error) {
        console.error('Erro no middleware canAccessAgenda:', error);
        return res.status(500).json({ message: 'Erro ao verificar permissões' });
    }
};

export { autenticar, isAdminOrManager, canAccessAgenda };