import express from 'express';
import {
    getUsersController,
    addUserController,
    deleteUserController,
    updateUserController,
    loginController,
    logoutController,
    checkAuthController,
    getUserNameController,
    updatePasswordController,
    refreshTokenController
} from '../controllers/userController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js'; // Importe o middleware de autenticação
import { requestReset, resetPassword, verifyToken } from '../controllers/resetController.js';
import { authLimiter, generalLimiter, writeLimiter } from '../middlewares/rateLimitMiddleware.js';
import { permissionMiddleware } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

// Rota de login (não precisa de autenticação)
router.post('/login', loginController);

// Rotas protegidas (exigem autenticação)
router.get('/users', authenticateToken, generalLimiter, permissionMiddleware('usuario'), getUsersController); // Listar usuários
router.post('/addUser', authenticateToken, writeLimiter, permissionMiddleware('usuario'), addUserController); // Adicionar usuário
router.delete('/deleteUser', authenticateToken, writeLimiter, permissionMiddleware('usuario'), deleteUserController); // Deletar usuário
router.put('/updateUser/:id', authenticateToken, writeLimiter, permissionMiddleware('usuario'), updateUserController); // Atualizar usuário
router.post('/logout', logoutController);
router.get('/check-auth', authenticateToken, checkAuthController);
router.get('/usuarioName', authenticateToken, generalLimiter, getUserNameController)
router.put('/update-password', authenticateToken, writeLimiter, updatePasswordController);

router.post('/refresh-token', authLimiter, refreshTokenController);

// resetPasswordRoutes
router.post('/reset-request', authLimiter, requestReset);
router.post('/verify-token', authLimiter, verifyToken);
router.post('/reset-password', authLimiter, resetPassword);



export default router;