import express from 'express';
import {
    addScheduleController,
    deleteScheduleController,
    getSchedulesController,
    updateScheduleController,
    getFkUserScheduleByIdController,
    getDataAgendamentoController,
} from '../controllers/scheduleController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.get('/schedules', authenticateToken, permissionMiddleware('agenda'), getSchedulesController);
router.post('/addSchedule', authenticateToken, permissionMiddleware('agenda'), addScheduleController);
router.delete('/deleteSchedule/:id', authenticateToken, permissionMiddleware('agenda'), deleteScheduleController);
router.put('/updateSchedule/:id', authenticateToken, updateScheduleController);
router.get('/scheduleFkUserId/:id', authenticateToken, permissionMiddleware('horario'), getFkUserScheduleByIdController);
router.get('/scheduleData/:id', authenticateToken, permissionMiddleware('horario'), getDataAgendamentoController);

export default router;