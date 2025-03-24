import jwt from 'jsonwebtoken';

const autenticar = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Acesso não autorizado' });
    }

    try {
        // Verifica o token
        const decoded = jwt.verify(token, 'secreto');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

const isAdminOrManager = (req, res, next) => {
    const allowedRoles = ['admin', 'gerente', 'secretario'];

    if (allowedRoles.includes(req.user.tipo_usuario)) {
        next(); // Permite acesso
    } else {
        res.status(403).json({
            message: 'Acesso negado. Somente administradores, gerentes ou secretários podem acessar esta rota.'
        });
    }
};

export { autenticar, isAdminOrManager };