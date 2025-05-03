import express from 'express';
import {
    getEnterprisesController,
    addEnterpriseController,
    deleteEnterpriseController,
    updateEnterpriseController,
    getEnterpriseNameController
} from '../controllers/enterpriseController.js';

import { autenticar } from '../middlewares/authMiddleware.js';
import { generalLimiter, writeLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.tipo_usuario === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Somente administradores podem acessar esta rota.' });
    }
};

// Leitura
router.get('/enterprises', autenticar, generalLimiter, isAdmin, getEnterprisesController);
router.get('/enterpriseName', autenticar, generalLimiter, getEnterpriseNameController);

// Escrita
router.post('/addEnterprise', autenticar, writeLimiter, isAdmin, addEnterpriseController);
router.delete('/deleteEnterprise', autenticar, writeLimiter, isAdmin, deleteEnterpriseController);
router.put('/updateEnterprise/:id', autenticar, writeLimiter, isAdmin, updateEnterpriseController);

export default router;
