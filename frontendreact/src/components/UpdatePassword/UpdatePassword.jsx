import React, { useState } from 'react';
import { API_URL } from '../../services/apiConfig';

const UpdatePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/update-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setMessage(data.message || 'Erro ao atualizar senha');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMessage('Erro ao conectar com o servidor');
        }
    };

    return (
        <div className='trocaSenha_conteiner_geral'>
            <form className='form_trocaSenha' onSubmit={handleUpdate}>
                <h2>Atualizar Senha</h2>
                <div className="form-group2">
                    <label>Senha atual:</label>
                    <input
                        type="password"
                        placeholder="Senha atual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className="form-group1">
                    <label>Nova senha:</label>
                    <input
                        type="password"
                        placeholder="Nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Atualizar</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UpdatePassword;
