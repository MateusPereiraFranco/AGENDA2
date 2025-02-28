const urlParams = new URLSearchParams(window.location.search);
const fk_agenda_id = urlParams.get('id');
console.log(fk_agenda_id)

// Função para carregar horarios
async function loadTimes(searchParams = {}) {
    try {
        // Define valores padrão para paginação e ordenação
        const defaultParams = {
            page: 1,
            limit: 10,
            sortBy: 'horario',
            order: 'ASC',
        };

        // Combina os parâmetros de busca com os valores padrão
        const params = { ...defaultParams, ...searchParams };

        // Constrói a query string com base nos parâmetros
        const queryString = new URLSearchParams(params).toString();
        const decodedQueryString = decodeURIComponent(queryString);

        console.log(decodedQueryString)
        const response = await fetch(
            `http://localhost:3000/api/times?${decodedQueryString}&fk_agenda_id=${fk_agenda_id}`
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar horarios');
        }

        const times = await response.json();
        const timeList = document.getElementById('timeList');

        // Exibe as horarios na lista com um botão de exclusão e atualização
        timeList.innerHTML = times
            .map(
                (time) => `
                    <li>
                        ${time.id_horario} - ${time.horario} - ${time.nome} - ${time.contato} - ${time.observacoes} - ${time.fk_agenda_id}
                        <button class="deleteButton" data-id="${time.id_horario}">Excluir</button>
                        <button class="updateButton" data-id="${time.id_horario}">Atualizar</button>
                    </li>
                `
            )
            .join('');

        // Adiciona eventos de clique aos botões de exclusão
        document.querySelectorAll('.deleteButton').forEach((button) => {
            button.addEventListener('click', deleteTime);
        });

        // Adiciona eventos de clique aos botões de atualização
        document.querySelectorAll('.updateButton').forEach((button) => {
            button.addEventListener('click', updateTime);
        });

        // Adiciona eventos de clique aos botões "Ver Agenda"
        document.querySelectorAll('.viewButton').forEach((button) => {
            button.addEventListener('click', viewTime);
        });

        // Atualiza os botões de paginação
        updatePaginationButtons(params.page);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar horarios. Tente novamente.');
    }
}

// Função para redirecionar para a página da horario
function viewTime(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da horario
    window.location.href = `data.html?id=${id}`; // Redireciona para horario.html com o ID
}


// Função para atualizar uma horario
async function updateTime(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da horario

    // Solicita ao usuário os novos dados da horario
    const nome = prompt('Novo nome da horario:');
    const cnpj = prompt('Novo CNPJ:');
    const email = prompt('Novo email:');

    if (!nome || !cnpj || !email) {
        alert('Todos os campos são obrigatórios!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/updateTime/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, cnpj, email }),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar horario');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de horarios após a atualização
        loadTimes();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar horario. Tente novamente.');
    }
}

// Função para deletar uma horario
async function deleteTime(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da horario

    try {
        const response = await fetch('http://localhost:3000/api/deleteTime', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }), // Envia o ID no corpo da requisição
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir horario');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de horarios após a exclusão
        loadTimes();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir horario. Tente novamente.');
    }
}


// Função para adicionar uma horario
async function addTime(event) {
    event.preventDefault();
    const horario = document.getElementById('time').value;
    const nome = document.getElementById('name').value;
    const contato = document.getElementById('contact').value;
    const observacoes = document.getElementById('observation').value;

    try {
        const response = await fetch('http://localhost:3000/api/addTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ horario, nome, contato, observacoes, fk_agenda_id }),
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar horario');
        }

        loadTimes(); // Recarrega a lista após adicionar
        document.getElementById('addTimeForm').reset(); // Limpa o formulário
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar horario. Tente novamente.');
    }
}

// Função para buscar horarios
async function searchTime(event) {
    event.preventDefault();
    const searchTime = document.getElementById('searchTime').value;

    // Cria um objeto com os parâmetros de busca
    const searchParams = {};
    if (searchTime) searchParams.horario = searchTime;

    // Carrega as horarios com base nos parâmetros de busca
    loadTimes(searchParams);
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

    // Carrega as horarios com base nos parâmetros de busca e na nova página
    loadTimes(searchParams);
}

// Eventos
document
    .getElementById('addTimeForm')
    .addEventListener('submit', addTime);

document
    .getElementById('searchTimeForm')
    .addEventListener('submit', searchTime);

// Carregar horarios ao iniciar
loadTimes();