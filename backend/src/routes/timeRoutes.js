import express from 'express'
import { getTimesController, addTimeController, deleteTimeController, updateTimeController } from '../controllers/timeController.js';

const router = express.Router();

// Rota para listar os horarios
router.get('/times', getTimesController);
router.post('/addTime', addTimeController);
router.delete('/deleteTime', deleteTimeController)
router.put('/updateTime/:id', updateTimeController)

export default router;