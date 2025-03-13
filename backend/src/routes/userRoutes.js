import express from 'express';
import {
    getUsersController,
    addUserController,
    deleteUserController,
    updateUserController,
    loginController,
    logoutController,
    checkAuthController,
} from '../controllers/userController.js';
import autenticar from '../middlewares/authMiddleware.js'; // Importe o middleware de autenticação

const router = express.Router();

// Rota de login (não precisa de autenticação)
router.post('/login', loginController);

// Rotas protegidas (exigem autenticação)
router.get('/users', autenticar, getUsersController); // Listar usuários
router.post('/addUser', autenticar, addUserController); // Adicionar usuário
router.delete('/deleteUser', autenticar, deleteUserController); // Deletar usuário
router.put('/updateUser/:id', autenticar, updateUserController); // Atualizar usuário
router.post('/logout', logoutController);
router.get('/check-auth', checkAuthController);


export default router;