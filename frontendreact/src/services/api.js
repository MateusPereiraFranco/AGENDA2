const API_URL = 'http://localhost:3000/api';

// Função para fazer login
export const login = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
        throw new Error('Erro ao fazer login');
    }
    return response.json();
};

export const get_fk_empresa_id = async (email) => {
    const userResponse = await fetch(`${API_URL}/users?email=${email}`);
    const userData = await userResponse.json();
    console.log(userData[0].fk_empresa_id)
    if (userResponse.ok) {
        return userData[0].fk_empresa_id;
    }
    else {
        throw new Error('Email não encontrado no banco');
    }

};


// Função para buscar empresas
export const fetchEmpresas = async (searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/enterprises?${queryString}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
    }
    return response.json();
    // Mudar a forma de busca para aceitar apenas 1 das buscas. ele necessita das 2 informações
};

// Função para adicionar uma empresa
export const addEmpresa = async (empresa) => {
    const response = await fetch(`${API_URL}/addEnterprise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar empresa');
    }
    return response.json();
};

// Função para atualizar uma empresa
export const updateEmpresa = async (id, empresa) => {
    const response = await fetch(`${API_URL}/updateEnterprise/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa),
    });
    if (!response.ok) {
        throw new Error('Erro ao atualizar empresa');
    }
    return response.json();
};

// Função para deletar uma empresa
export const deleteEmpresa = async (id) => {
    const response = await fetch(`${API_URL}/deleteEnterprise`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir empresa');
    }
    return response.json();
};

// Função para buscar usuários de uma empresa
export const fetchUsuarios = async (fk_empresa_id, searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/users?${queryString}&fk_empresa_id=${fk_empresa_id}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
    }
    return response.json();
};

// Função para buscar agendamentos de um usuário
export const fetchAgendamentos = async (fk_usuario_id, searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/schedules?${queryString}&fk_usuario_id=${fk_usuario_id}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar agendamentos');
    }
    return response.json();
};

// Função para buscar horários de uma agenda
export const fetchHorarios = async (fk_agenda_id, searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/times?${queryString}&fk_agenda_id=${fk_agenda_id}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar horários');
    }
    return response.json();
};

// Função para adicionar um horário
export const addHorario = async (horario) => {
    const response = await fetch(`${API_URL}/addTime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horario),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar horário');
    }
    return response.json();
};

// Função para deletar um horário
export const deleteHorario = async (id) => {
    const response = await fetch(`${API_URL}/deleteTime`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir horário');
    }
    return response.json();
};

// Função para deletar um agendamento
export const deleteAgendamento = async (id) => {
    const response = await fetch(`${API_URL}/deleteSchedule`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir agendamento');
    }
    return response.json();
};

// Função para atualizar um agendamento
export const updateAgendamento = async (id, agendamento) => {
    const response = await fetch(`${API_URL}/updateSchedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento),
    });
    if (!response.ok) {
        throw new Error('Erro ao atualizar agendamento');
    }
    return response.json();
};

// Função para deletar um usuário
export const deleteUsuario = async (id) => {
    const response = await fetch(`${API_URL}/deleteUser`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
    }
    return response.json();
};

// Função para atualizar um usuário
export const updateUsuario = async (id, usuario) => {
    const response = await fetch(`${API_URL}/updateUser/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
    }
    return response.json();
};

// Função para adicionar um usuário
export const addUsuario = async (usuario) => {
    const response = await fetch(`${API_URL}/addUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar usuário');
    }
    return response.json();
};

// Função para adicionar um agendamento
export const addAgendamento = async (agendamento) => {
    const response = await fetch(`${API_URL}/addSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar agendamento');
    }
    return response.json();
};