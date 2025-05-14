import { decodeId } from '../utils/hashids.js';

import { getUsuarioById } from '../models/userModel.js';
import { checkPermissionByType } from '../utils/permissionService.js';


export const permissionMiddleware = (pageType) => {
    return async (req, res, next) => {
        try {
            let pageId;
            switch (req.method) {
                case 'GET':
                    if (pageType === 'usuario') {
                        if (req.query.fk_empresa_id) {
                            pageId = decodeId(req.query.fk_empresa_id);
                        }
                    } else if (pageType === 'agenda') {
                        if (req.query.fk_usuario_id) {
                            pageId = decodeId(req.query.fk_usuario_id);
                        }
                    }
                    break;
                case 'POST':
                    if (pageType === 'usuario') {
                        console.log('req.body', req.body);
                        if (req.body.fk_empresa_id) {
                            pageId = decodeId(req.body.fk_empresa_id);
                        }
                        else {
                            return res.status(400).send('ID de empresa não fornecido');
                        }
                    }
                    break
                case 'PUT':
                case 'DELETE':
                    if (pageType === 'usuario') {
                        let idUser;
                        if (req.body.id) {
                            idUser = decodeId(req.body.id);
                        } else if (req.params.id) {
                            idUser = decodeId(req.params.id);
                        }
                        if (!idUser) {
                            return res.status(400).send('ID de usuário não fornecido');
                        }

                        const usuario = await getUsuarioById(idUser);
                        if (!usuario) return res.status(404).send('Usuário não encontrado');
                        pageId = usuario.fk_empresa_id;

                    }

                    break;
            }
            console.log('pageId', pageId);
            if (!pageId && pageType !== 'atualizar-senha') {
                return res.status(400).send('Parâmetro de empresa ou usuário ausente');
            }

            const permitido = await checkPermissionByType(req.user, pageType, pageId);
            if (!permitido) return res.status(403).send('Acesso negado');
            next();
        } catch (err) {
            console.error('Erro ao verificar permissão:', err);
            return res.status(500).send('Erro interno de permissão');
        }
    };
};
