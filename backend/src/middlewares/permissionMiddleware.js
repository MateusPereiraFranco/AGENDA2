import { decodeId } from '../utils/hashids.js';

import { getUsuarioById } from '../models/userModel.js';
import { checkPermissionByType } from '../utils/permissionService.js';
import { getScheduleById } from '../models/scheduleModel.js';
import { getTimeById } from '../models/timeModel.js';


export const permissionMiddleware = (pageType) => {
    return async (req, res, next) => {
        try {
            let pageId;
            switch (req.method) {
                case 'GET':
                    // Lógica página usuário
                    if (pageType === 'usuario') {
                        if (req.query.fk_empresa_id) {
                            try {
                                pageId = decodeId(req.query.fk_empresa_id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        } else {
                            return res.status(400).send('ID de empresa não fornecido');
                        }

                        // Lógica página agenda
                    } else if (pageType === 'agenda') {
                        if (req.query.fk_usuario_id) {
                            try {
                                pageId = decodeId(req.query.fk_usuario_id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        } else {
                            return res.status(400).send('ID de usuário não fornecido');
                        }
                    } else if (pageType === 'horario') {
                        if (req.query.fk_agenda_id) {
                            try {
                                pageId = decodeId(req.query.fk_agenda_id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        } else {
                            return res.status(400).send('ID de agenda não fornecido');
                        }
                    }
                    break;
                case 'POST':
                    if (pageType === 'usuario') {
                        if (req.body.fk_empresa_id) {
                            try {
                                pageId = decodeId(req.body.fk_empresa_id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        }
                        else {
                            return res.status(400).send('ID de empresa não fornecido');
                        }
                    }
                    if (pageType === 'agenda') {
                        if (req.body.fk_usuario_id) {
                            try {
                                pageId = decodeId(req.body.fk_usuario_id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        }
                        else {
                            return res.status(400).send('ID de usuário não fornecido');
                        }
                    }
                    if (pageType === 'horario') {
                        if (req.body.horario.fk_agenda_id) {
                            try {
                                pageId = decodeId(req.body.horario.fk_agenda_id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        }
                        else {
                            return res.status(400).send('ID de agenda não fornecido');
                        }
                    }
                    break
                case 'PUT':
                case 'DELETE':
                    if (pageType === 'usuario') {
                        let idUser;
                        if (req.params.id) {
                            try {
                                idUser = decodeId(req.params.id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        }
                        const usuario = await getUsuarioById(idUser);
                        if (!usuario) return res.status(404).send('Usuário não encontrado');
                        pageId = usuario.fk_empresa_id;
                    }
                    else if (pageType === 'agenda') {
                        let idAgenda;
                        if (req.params.id) {
                            try {
                                idAgenda = decodeId(req.params.id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        }
                        const agenda = await getScheduleById(idAgenda);
                        if (!agenda) return res.status(404).send('Agenda não encontrada');
                        pageId = agenda.fk_usuario_id;
                    }
                    else if (pageType === 'horario') {
                        let idHorario;
                        if (req.params.id) {
                            try {
                                idHorario = decodeId(req.params.id);
                            } catch (error) {
                                console.error('Erro ao decodificar ID:', error);
                                return res.status(400).json('ID inválido');
                            }
                        }
                        const horario = await getTimeById(idHorario);
                        if (!horario) return res.status(404).send('Horário não encontrado');
                        pageId = horario.fk_agenda_id;
                    }
                    break;
            }
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
