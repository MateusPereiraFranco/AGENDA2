import express from 'express'
import { getUsersController, addUserController, deleteUserController, updateUserController, loginController } from '../controllers/userController.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota para listar os usuarios
router.post('/login', loginController);
router.get('/users', getUsersController);
router.post('/addUser', addUserController);
router.delete('/deleteUser', deleteUserController)
router.put('/updateUser/:id', updateUserController)

// Exemplo de rota protegida
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Rota protegida', user: req.user });
});

export default router;