import express from 'express';
import { getTimesController, addTimeController, deleteTimeController, updateTimeController } from '../controllers/timeController.js';
import autenticar from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/times', autenticar, getTimesController);
router.post('/addTime', autenticar, addTimeController);
router.delete('/deleteTime', autenticar, deleteTimeController);
router.put('/updateTime/:id', autenticar, updateTimeController);

export default router;