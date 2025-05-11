// src/middlewares/rateLimitMiddleware.js
import rateLimit from 'express-rate-limit';

// Função para gerar uma chave de rate limit por usuário logado ou por IP
const defaultKeyGenerator = (req) => {
    return req.user?.id_usuario || req.ip;
};

// 1. Limite para login, reset de senha, refresh token, etc (sensível)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100000000,
    message: 'Muitas tentativas - tente novamente mais tarde.',
    keyGenerator: defaultKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Limite para consultas/listagens normais
export const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30000000000,
    message: 'Limite de requisições excedido - tente novamente em instantes.',
    keyGenerator: defaultKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Limite para escritas (inserção, deleção, edição)
export const writeLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 5000000000,
    message: 'Muitas ações em pouco tempo. Aguarde um pouco antes de continuar.',
    keyGenerator: defaultKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
});
