const urlParams = new URLSearchParams(window.location.search);
const fk_empresa_id = urlParams.get('id');
console.log(fk_empresa_id)

// Função para carregar usuarios
async function loadUsers(searchParams = {}) {
    try {
        // Define valores padrão para paginação e ordenação
        const defaultParams = {
            page: 1,
            limit: 10,
            sortBy: 'nome',
            order: 'ASC',
        };

        // Combina os parâmetros de busca com os valores padrão
        const params = { ...defaultParams, ...searchParams };

        // Constrói a query string com base nos parâmetros
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `http://localhost:3000/api/users?${queryString}&fk_empresa_id=${fk_empresa_id}`
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar usuarios');
        }

        const users = await response.json();
        const userList = document.getElementById('userList');

        // Exibe as usuarios na lista com um botão de exclusão e atualização
        userList.innerHTML = users
            .map(
                (user) => `
                    <li>
                        ${user.id_usuario} - ${user.nome} - ${user.email} - ${user.tipo_usuario} - ${user.fk_empresa_id}
                        <button class="deleteButton" data-id="${user.id_usuario}">Excluir</button>
                        <button class="updateButton" data-id="${user.id_usuario}">Atualizar</button>
                        <button class="viewButton" data-id="${user.id_usuario}">Ver funcionário</button>
                    </li>
                `
            )
            .join('');

        // Adiciona eventos de clique aos botões de exclusão
        document.querySelectorAll('.deleteButton').forEach((button) => {
            button.addEventListener('click', deleteUser);
        });

        // Adiciona eventos de clique aos botões de atualização
        document.querySelectorAll('.updateButton').forEach((button) => {
            button.addEventListener('click', updateUser);
        });

        // Adiciona eventos de clique aos botões "Ver funcionário"
        document.querySelectorAll('.viewButton').forEach((button) => {
            button.addEventListener('click', viewUser);
        });

        // Atualiza os botões de paginação
        updatePaginationButtons(params.page);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar usuarios. Tente novamente.');
    }
}

// Função para redirecionar para a página da empresa
function viewUser(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da empresa
    window.location.href = `usuario.html?id=${id}`; // Redireciona para empresa.html com o ID
}


// Função para atualizar uma usuario
async function updateUser(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da usuario

    // Solicita ao usuário os novos dados da usuario
    const nome = prompt('Novo nome da usuario:');
    const cnpj = prompt('Novo CNPJ:');
    const email = prompt('Novo email:');

    if (!nome || !cnpj || !email) {
        alert('Todos os campos são obrigatórios!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/updateUser/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, cnpj, email }),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar usuario');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de usuarios após a atualização
        loadUsers();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar usuario. Tente novamente.');
    }
}

// Função para deletar uma usuario
async function deleteUser(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da usuario

    try {
        const response = await fetch('http://localhost:3000/api/deleteUser', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }), // Envia o ID no corpo da requisição
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir usuario');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de usuarios após a exclusão
        loadUsers();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir usuario. Tente novamente.');
    }
}

// Função para adicionar uma usuario
async function addUser(event) {
    event.preventDefault();
    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    const tipo_usuario = document.getElementById('tipo_usuario').value;

    try {
        const response = await fetch('http://localhost:3000/api/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, senha, tipo_usuario, fk_empresa_id }),
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar usuario');
        }

        loadUsers(); // Recarrega a lista após adicionar
        document.getElementById('addUserForm').reset(); // Limpa o formulário
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar usuario. Tente novamente.');
    }
}

// Função para buscar usuarios
async function searchUser(event) {
    event.preventDefault();
    const searchName = document.getElementById('searchName').value;

    // Cria um objeto com os parâmetros de busca
    const searchParams = {};
    if (searchName) searchParams.nome = searchName;

    // Carrega as usuarios com base nos parâmetros de busca
    loadUsers(searchParams);
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
    const searchName = document.getElementById('searchName').value;

    // Cria um objeto com os parâmetros de busca e a nova página
    const searchParams = { page: newPage };
    if (searchName) searchParams.nome = searchName;

    // Carrega as usuarios com base nos parâmetros de busca e na nova página
    loadUsers(searchParams);
}

// Eventos
document
    .getElementById('addUserForm')
    .addEventListener('submit', addUser);

document
    .getElementById('searchUserForm')
    .addEventListener('submit', searchUser);

// Carregar usuarios ao iniciar
loadUsers();