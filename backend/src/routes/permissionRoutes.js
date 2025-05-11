// routes/permissionRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { checkPermissionByType } from '../utils/permissionService.js';


const router = express.Router();

router.get('/permission/:pageType/:hashid', authenticateToken, async (req, res) => {
    try {
        const { pageType, hashid } = req.params;

        if (!hashid) {
            return res.status(400).json({ granted: false, message: 'ID inválido' });
        }

        const granted = await checkPermissionByType(req.user, pageType, hashid);
        return res.json({ granted });

    } catch (err) {
        return res.status(500).json({ granted: false, message: 'Erro interno no servidor' });
    }
});

export default router;
