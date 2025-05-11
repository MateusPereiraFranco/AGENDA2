import express from 'express';
import {
    getTimesController,
    addTimeController,
    deleteTimeController,
    updateTimeController
} from '../controllers/timeController.js';

import { authenticateToken, checkAcesso } from '../middlewares/authMiddleware.js';
import { generalLimiter, writeLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Leitura
router.get('/times', authenticateToken, generalLimiter, getTimesController);

// Escrita
router.post('/addTime', authenticateToken, writeLimiter, addTimeController);
router.delete('/deleteTime/:id', authenticateToken, checkAcesso('horario'), writeLimiter, deleteTimeController);
router.put('/updateTime/:id', authenticateToken, checkAcesso('horario'), writeLimiter, updateTimeController);

export default router;
