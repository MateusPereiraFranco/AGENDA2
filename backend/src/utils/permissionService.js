import pool from '../config/database.js';

export async function checkPermissionByType(user, pageType, pageId) {

    const { tipo_usuario, id, fk_empresa_id } = user;

    if (tipo_usuario === 'admin') return true;

    if (pageType === 'atualizar-senha') return true;

    if (pageType === 'agenda') {
        if (id == pageId) return true;

        if (['gerente', 'secretario'].includes(tipo_usuario)) {
            try {
                const fk_empresa_id_dono_agenda = await pool.query(
                    'SELECT fk_empresa_id FROM usuario WHERE id_usuario = $1',
                    [pageId]
                );
                if (fk_empresa_id_dono_agenda.rowCount === 0) {
                    return false;
                }
                return fk_empresa_id_dono_agenda.rows[0].fk_empresa_id == fk_empresa_id;
            } catch (error) {
                console.error('Erro ao verificar permissão de agenda:', error);
                return false;
            }
        }
        return false;
    }

    if (pageType === 'usuario') {
        if (tipo_usuario === 'funcionario') return false;

        if (['gerente', 'secretario'].includes(tipo_usuario)) {
            return pageId.toString() == fk_empresa_id.toString();
        }
        return false;
    }

    if (pageType === 'empresa') {
        return false;
    }

    if (pageType === 'horario') {
        return true;
    }

    return false;
}
