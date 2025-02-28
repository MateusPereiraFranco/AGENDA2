import express from 'express'
import { addScheduleController, deleteScheduleController, getSchedulesController, updateScheduleController } from '../controllers/scheduleController.js';

const router = express.Router();


// Rota para listar os agendas
router.get('/schedules', getSchedulesController);
router.post('/addSchedule', addScheduleController);
router.delete('/deleteSchedule', deleteScheduleController)
router.put('/updateSchedule/:id', updateScheduleController)

export default router;