import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
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


export { authenticateToken };