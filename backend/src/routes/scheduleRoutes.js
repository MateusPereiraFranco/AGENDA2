import express from 'express';
import {
    addScheduleController,
    deleteScheduleController,
    getSchedulesController,
    updateScheduleController,
    getFkUserScheduleByIdController,
} from '../controllers/scheduleController.js';
import { autenticar, canAccessAgenda } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/schedules', autenticar, getSchedulesController);
router.post('/addSchedule', autenticar, addScheduleController);
router.delete('/deleteSchedule', autenticar, deleteScheduleController);
router.put('/updateSchedule/:id', autenticar, updateScheduleController);
router.get('/schedule/:id', autenticar, getFkUserScheduleByIdController);

export default router;