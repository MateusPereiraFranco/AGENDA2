import express from 'express';
import {
    addScheduleController,
    deleteScheduleController,
    getSchedulesController,
    updateScheduleController,
} from '../controllers/scheduleController.js';
import autenticar from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/schedules', autenticar, getSchedulesController);
router.post('/addSchedule', autenticar, addScheduleController);
router.delete('/deleteSchedule', autenticar, deleteScheduleController);
router.put('/updateSchedule/:id', autenticar, updateScheduleController);

export default router;