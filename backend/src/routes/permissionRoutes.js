// routes/permissionRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { decode } from '../utils/hashids.js'; // Utilitário para decodificar o hashid
import { checkAcesso } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota: /api/permissao/agenda/:hashid
router.get('/agenda/:hashid', authenticateToken, async (req, res, next) => {
    try {
        // Decodifica o hashid para o id real
        const [id] = decode(req.params.hashid);
        if (!id) return res.status(400).json({ granted: false, message: 'ID inválido' });

        // Insere o ID decodificado no lugar certo para o middleware
        req.params.id = id;

        // Usa o middleware checkAcesso passando o tipo de recurso 'agenda'
        checkAcesso('agenda')(req, res, () => {
            return res.json({ granted: true });
        });

    } catch (err) {
        console.error('Erro em /permissao/agenda:', err);
        return res.status(500).json({ granted: false, message: 'Erro interno no servidor' });
    }
});

export default router;
