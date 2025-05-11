import express from 'express';
import {
    addScheduleController,
    deleteScheduleController,
    getSchedulesController,
    updateScheduleController,
    getFkUserScheduleByIdController,
    getDataAgendamentoController,
} from '../controllers/scheduleController.js';
import { authenticateToken, checkAcesso } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/schedules', authenticateToken, getSchedulesController);
router.post('/addSchedule', authenticateToken, addScheduleController);
router.delete('/deleteSchedule/:id', authenticateToken, checkAcesso('agenda'), deleteScheduleController);
router.put('/updateSchedule/:id', authenticateToken, checkAcesso('agenda'), updateScheduleController);
router.get('/schedule/:id', authenticateToken, checkAcesso('agenda'), getFkUserScheduleByIdController);
router.get('/scheduleData/:id', authenticateToken, checkAcesso('agenda'), getDataAgendamentoController);

export default router;