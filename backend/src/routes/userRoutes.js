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
} from '../controllers/userController.js';
import { autenticar, isAdminOrManager } from '../middlewares/authMiddleware.js'; // Importe o middleware de autenticação

const router = express.Router();

// Rota de login (não precisa de autenticação)
router.post('/login', loginController);

// Rotas protegidas (exigem autenticação)
router.get('/users', autenticar, isAdminOrManager, getUsersController); // Listar usuários
router.post('/addUser', autenticar, isAdminOrManager, addUserController); // Adicionar usuário
router.delete('/deleteUser', autenticar, isAdminOrManager, deleteUserController); // Deletar usuário
router.put('/updateUser/:id', autenticar, isAdminOrManager, updateUserController); // Atualizar usuário
router.get('/getEmail', getUserByEmailController);
router.post('/logout', logoutController);
router.get('/check-auth', checkAuthController);


export default router;