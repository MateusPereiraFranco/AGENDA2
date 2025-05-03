import express from 'express';
import {
    addScheduleController,
    deleteScheduleController,
    getSchedulesController,
    updateScheduleController,
    getFkUserScheduleByIdController,
    getDataAgendamentoController,
} from '../controllers/scheduleController.js';
import { autenticar, checkAcesso } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/schedules', autenticar, checkAcesso('agenda'), getSchedulesController);
router.post('/addSchedule', autenticar, checkAcesso('agenda'), addScheduleController);
router.delete('/deleteSchedule/:id', autenticar, checkAcesso('agenda'), deleteScheduleController);
router.put('/updateSchedule/:id', autenticar, checkAcesso('agenda'), updateScheduleController);
router.get('/schedule/:id', autenticar, checkAcesso('horario'), getFkUserScheduleByIdController);
router.get('/scheduleData/:id', autenticar, checkAcesso('horario'), getDataAgendamentoController);

export default router;