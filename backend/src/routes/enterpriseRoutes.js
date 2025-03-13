import express from 'express';
import { getEnterprisesController, addEnterpriseController, deleteEnterpriseController, updateEnterpriseController } from '../controllers/enterpriseController.js';
import autenticar from '../middlewares/authMiddleware.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.tipo_usuario === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Somente administradores podem acessar esta rota.' });
    }
};

router.get('/enterprises', autenticar, isAdmin, getEnterprisesController);
router.post('/addEnterprise', autenticar, isAdmin, addEnterpriseController);
router.delete('/deleteEnterprise', autenticar, isAdmin, deleteEnterpriseController);
router.put('/updateEnterprise/:id', autenticar, isAdmin, updateEnterpriseController);

export default router;