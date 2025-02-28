const urlParams = new URLSearchParams(window.location.search);
const fk_usuario_id = urlParams.get('id');
console.log(fk_usuario_id)

// Função para carregar agendas
async function loadSchedules(searchParams = {}) {
    try {
        // Define valores padrão para paginação e ordenação
        const defaultParams = {
            page: 1,
            limit: 10,
            sortBy: 'data',
            order: 'ASC',
        };

        // Combina os parâmetros de busca com os valores padrão
        const params = { ...defaultParams, ...searchParams };

        // Constrói a query string com base nos parâmetros
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `http://localhost:3000/api/schedules?${queryString}&fk_usuario_id=${fk_usuario_id}`
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar agendas');
        }

        const schedules = await response.json();
        const scheduleList = document.getElementById('scheduleList');

        // Exibe as agendas na lista com um botão de exclusão e atualização
        scheduleList.innerHTML = schedules
            .map(
                (schedule) => `
                    <li>
                        ${schedule.id_agenda} - ${schedule.data} - ${schedule.fk_usuario_id}
                        <button class="deleteButton" data-id="${schedule.id_agenda}">Excluir</button>
                        <button class="updateButton" data-id="${schedule.id_agenda}">Atualizar</button>
                        <button class="viewButton" data-id="${schedule.id_agenda}">Ver Agenda</button>
                    </li>
                `
            )
            .join('');

        // Adiciona eventos de clique aos botões de exclusão
        document.querySelectorAll('.deleteButton').forEach((button) => {
            button.addEventListener('click', deleteSchedule);
        });

        // Adiciona eventos de clique aos botões de atualização
        document.querySelectorAll('.updateButton').forEach((button) => {
            button.addEventListener('click', updateSchedule);
        });

        // Adiciona eventos de clique aos botões "Ver Agenda"
        document.querySelectorAll('.viewButton').forEach((button) => {
            button.addEventListener('click', viewSchedule);
        });

        // Atualiza os botões de paginação
        updatePaginationButtons(params.page);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar agendas. Tente novamente.');
    }
}

// Função para redirecionar para a página da agenda
function viewSchedule(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da agenda
    window.location.href = `data.html?id=${id}`; // Redireciona para agenda.html com o ID
}


// Função para atualizar uma agenda
async function updateSchedule(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da agenda

    // Solicita ao usuário os novos dados da agenda
    const nome = prompt('Novo nome da agenda:');
    const cnpj = prompt('Novo CNPJ:');
    const email = prompt('Novo email:');

    if (!nome || !cnpj || !email) {
        alert('Todos os campos são obrigatórios!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/updateSchedule/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, cnpj, email }),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar agenda');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de agendas após a atualização
        loadSchedules();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar agenda. Tente novamente.');
    }
}

// Função para deletar uma agenda
async function deleteSchedule(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da agenda

    try {
        const response = await fetch('http://localhost:3000/api/deleteSchedule', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }), // Envia o ID no corpo da requisição
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir agenda');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de agendas após a exclusão
        loadSchedules();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir agenda. Tente novamente.');
    }
}


// Função para adicionar uma agenda
async function addSchedule(event) {
    event.preventDefault();
    const data = document.getElementById('data').value;

    try {
        const response = await fetch('http://localhost:3000/api/addSchedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data, fk_usuario_id }),
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar agenda');
        }

        loadSchedules(); // Recarrega a lista após adicionar
        document.getElementById('addScheduleForm').reset(); // Limpa o formulário
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar agenda. Tente novamente.');
    }
}

// Função para buscar agendas
async function searchSchedule(event) {
    event.preventDefault();
    const searchData = document.getElementById('searchData').value;

    // Cria um objeto com os parâmetros de busca
    const searchParams = {};
    if (searchData) searchParams.data = searchData;

    // Carrega as agendas com base nos parâmetros de busca
    loadSchedules(searchParams);
}

// Função para atualizar os botões de paginação
function updatePaginationButtons(currentPage) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    if (prevButton && nextButton) {
        prevButton.disabled = currentPage === 1; // Desabilita o botão "Anterior" na primeira página
        prevButton.onclick = () => changePage(currentPage - 1);
        nextButton.onclick = () => changePage(currentPage + 1);
    }
}

// Função para mudar de página
async function changePage(newPage) {
    const searchData = document.getElementById('searchData').value;

    // Cria um objeto com os parâmetros de busca e a nova página
    const searchParams = { page: newPage };
    if (searchData) searchParams.data = searchData;

    // Carrega as agendas com base nos parâmetros de busca e na nova página
    loadSchedules(searchParams);
}

// Eventos
document
    .getElementById('addScheduleForm')
    .addEventListener('submit', addSchedule);

document
    .getElementById('searchScheduleForm')
    .addEventListener('submit', searchSchedule);

// Carregar agendas ao iniciar
loadSchedules();