import express from 'express';
import {
    getTimesController,
    addTimeController,
    deleteTimeController,
    updateTimeController
} from '../controllers/timeController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';
import { generalLimiter, writeLimiter } from '../middlewares/rateLimitMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

// Leitura
router.get('/times', authenticateToken, generalLimiter, permissionMiddleware('horario'), getTimesController);

// Escrita
router.post('/addTime', authenticateToken, writeLimiter, permissionMiddleware('horario'), addTimeController);
router.delete('/deleteTime/:id', authenticateToken, writeLimiter, permissionMiddleware('horario'), deleteTimeController);
router.put('/updateTime/:id', authenticateToken, writeLimiter, permissionMiddleware('horario'), updateTimeController);

export default router;
