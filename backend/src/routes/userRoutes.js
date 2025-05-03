import express from 'express';
import {
    getUsersController,
    addUserController,
    deleteUserController,
    updateUserController,
    loginController,
    logoutController,
    checkAuthController,
    getUserByEmailController,
    getUserNameController,
    updatePasswordController,
    refreshTokenController
} from '../controllers/userController.js';

import { autenticar, isAdminOrManager } from '../middlewares/authMiddleware.js'; // Importe o middleware de autenticação
import { requestReset, resetPassword, verifyToken } from '../controllers/resetController.js';
import { authLimiter, generalLimiter, writeLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Rota de login (não precisa de autenticação)
router.post('/login', authLimiter, loginController);

// Rotas protegidas (exigem autenticação)
router.get('/users', autenticar, generalLimiter, isAdminOrManager, getUsersController); // Listar usuários
router.post('/addUser', autenticar, writeLimiter, isAdminOrManager, addUserController); // Adicionar usuário
router.delete('/deleteUser', autenticar, writeLimiter, isAdminOrManager, deleteUserController); // Deletar usuário
router.put('/updateUser/:id', autenticar, writeLimiter, isAdminOrManager, updateUserController); // Atualizar usuário
router.get('/getEmail', generalLimiter, getUserByEmailController);
router.post('/logout', logoutController);
router.get('/check-auth', autenticar, checkAuthController);
router.get('/usuarioName', autenticar, generalLimiter, getUserNameController)
router.put('/update-password', autenticar, writeLimiter, updatePasswordController);

router.post('/refresh-token', authLimiter, refreshTokenController);

// resetPasswordRoutes
router.post('/reset-request', authLimiter, requestReset);
router.post('/verify-token', authLimiter, verifyToken);
router.post('/reset-password', authLimiter, resetPassword);



export default router;