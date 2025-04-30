import cron from 'node-cron';
import pool from '../config/database.js';


// Limpa tokens expirados ou já usados a cada hora
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Rodando limpeza de reset_token...');
    try {
        const result = await pool.query(`
            DELETE FROM reset_token
            WHERE expires_at < NOW() OR usado = TRUE;
        `);
        console.log(`✅ ${result.rowCount} tokens expirados/usados removidos.`);
    } catch (err) {
        console.error('❌ Erro ao limpar reset_token:', err.message);
    }
});
