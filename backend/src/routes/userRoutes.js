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
router.post('/login', authLimiter, loginController);

// Rotas protegidas (exigem autenticação)
router.get('/users', authenticateToken, generalLimiter, permissionMiddleware('usuario'), getUsersController); // Listar usuários
router.post('/addUser', authenticateToken, writeLimiter, permissionMiddleware('usuario'), addUserController); // Adicionar usuário
router.delete('/deleteUser/:id', authenticateToken, writeLimiter, permissionMiddleware('usuario'), deleteUserController); // Deletar usuário
router.put('/updateUser/:id', authenticateToken, writeLimiter, permissionMiddleware('usuario'), updateUserController); // Atualizar usuário
router.post('/logout', authLimiter, logoutController);
router.get('/check-auth', authenticateToken, generalLimiter, checkAuthController);
router.get('/usuarioName/:id', authenticateToken, generalLimiter, getUserNameController)
router.put('/update-password/:id', authenticateToken, writeLimiter, updatePasswordController);

router.post('/refresh-token', authLimiter, refreshTokenController);

// resetPasswordRoutes
router.post('/reset-request', authLimiter, requestReset);
router.post('/verify-token', authLimiter, verifyToken);
router.post('/reset-password', authLimiter, resetPassword);


export default router;