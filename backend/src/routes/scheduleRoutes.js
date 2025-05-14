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


const router = express.Router();

router.get('/schedules', authenticateToken, getSchedulesController);
router.post('/addSchedule', authenticateToken, addScheduleController);
router.delete('/deleteSchedule/:id', authenticateToken, deleteScheduleController);
router.put('/updateSchedule/:id', authenticateToken, updateScheduleController);
router.get('/schedule/:id', authenticateToken, getFkUserScheduleByIdController);
router.get('/scheduleData/:id', authenticateToken, getDataAgendamentoController);

export default router;