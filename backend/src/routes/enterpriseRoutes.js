import express from 'express';
import {
    getEnterprisesController,
    addEnterpriseController,
    deleteEnterpriseController,
    updateEnterpriseController,
    getEnterpriseNameController
} from '../controllers/enterpriseController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';
import { generalLimiter, writeLimiter } from '../middlewares/rateLimitMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.tipo_usuario === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Somente administradores podem acessar esta rota.' });
    }
};

// Leitura
router.get('/enterprises', authenticateToken, generalLimiter, isAdmin, getEnterprisesController);
router.get('/enterpriseName/:id', authenticateToken, generalLimiter, getEnterpriseNameController);

// Escrita
router.post('/addEnterprise', authenticateToken, writeLimiter, isAdmin, addEnterpriseController);
router.delete('/deleteEnterprise/:id', authenticateToken, writeLimiter, isAdmin, deleteEnterpriseController);
router.put('/updateEnterprise/:id', authenticateToken, writeLimiter, isAdmin, updateEnterpriseController);

export default router;
