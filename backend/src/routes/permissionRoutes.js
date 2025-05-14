// routes/permissionRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { checkPermissionByType } from '../utils/permissionService.js';
import { decodeId } from '../utils/hashids.js';

const router = express.Router();

router.get('/permission/:pageType/:hashid', authenticateToken, async (req, res) => {
    try {
        const { pageType, hashid } = req.params;
        if (!hashid) {
            return res.status(400).json({ granted: false, message: 'ID inválido' });

        }
        if (!pageType) {
            return res.status(400).json({ granted: false, message: 'Tipo de página inválido' });
        }

        let decodedId;
        try {
            decodedId = decodeId(hashid);
        } catch {
            return res.status(400).json({ granted: false, message: 'ID inválido' });
        }

        const granted = await checkPermissionByType(req.user, pageType, decodedId);
        return res.json({ granted });

    } catch (err) {
        return res.status(500).json({ granted: false, message: 'Erro interno no servidor' });
    }
});

export default router;
