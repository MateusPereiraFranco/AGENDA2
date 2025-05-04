import express from 'express';
import {
    getTimesController,
    addTimeController,
    deleteTimeController,
    updateTimeController
} from '../controllers/timeController.js';

import { autenticar, checkAcesso } from '../middlewares/authMiddleware.js';
import { generalLimiter, writeLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Leitura
router.get('/times', autenticar, generalLimiter, getTimesController);

// Escrita
router.post('/addTime', autenticar, checkAcesso('horario'), writeLimiter, addTimeController);
router.delete('/deleteTime', autenticar, checkAcesso('horario'), writeLimiter, deleteTimeController);
router.put('/updateTime/:id', autenticar, checkAcesso('horario'), writeLimiter, updateTimeController);

export default router;
