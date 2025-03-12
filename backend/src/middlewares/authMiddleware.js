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

export default autenticar;