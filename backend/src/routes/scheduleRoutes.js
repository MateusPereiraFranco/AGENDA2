import express from 'express';
import {
    addScheduleController,
    deleteScheduleController,
    getSchedulesController,
    updateScheduleController,
    getFkUserScheduleByIdController,
    getDataAgendamentoController,
} from '../controllers/scheduleController.js';
import { autenticar, canAccessAgenda } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/schedules', autenticar, canAccessAgenda, getSchedulesController);
router.post('/addSchedule', autenticar, canAccessAgenda, addScheduleController);
router.delete('/deleteSchedule', autenticar, canAccessAgenda, deleteScheduleController);
router.put('/updateSchedule/:id', autenticar, canAccessAgenda, updateScheduleController);
router.get('/schedule/:id', autenticar, getFkUserScheduleByIdController);
router.get('/scheduleData/:id', autenticar, getDataAgendamentoController);

export default router;