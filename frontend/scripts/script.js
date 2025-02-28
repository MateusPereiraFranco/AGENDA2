// Função para carregar empresas
async function loadEnterprises(searchParams = {}) {
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
            `http://localhost:3000/api/enterprises?${queryString}`
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar empresas');
        }

        const enterprises = await response.json();
        const enterpriseList = document.getElementById('enterpriseList');

        // Exibe as empresas na lista com botões de exclusão, atualização e "Ver Empresa"
        enterpriseList.innerHTML = enterprises
            .map(
                (enterprise) => `
                    <li>
                        ID: ${enterprise.id_empresa} - Nome: ${enterprise.nome} - CNPJ: ${enterprise.cnpj} - Email: ${enterprise.email}
                        <button class="deleteButton" data-id="${enterprise.id_empresa}">Excluir</button>
                        <button class="updateButton" data-id="${enterprise.id_empresa}">Atualizar</button>
                        <button class="viewButton" data-id="${enterprise.id_empresa}">Ver Empresa</button>
                    </li>
                `
            )
            .join('');

        // Adiciona eventos de clique aos botões de exclusão
        document.querySelectorAll('.deleteButton').forEach((button) => {
            button.addEventListener('click', deleteEnterprise);
        });

        // Adiciona eventos de clique aos botões de atualização
        document.querySelectorAll('.updateButton').forEach((button) => {
            button.addEventListener('click', updateEnterprise);
        });

        // Adiciona eventos de clique aos botões "Ver Empresa"
        document.querySelectorAll('.viewButton').forEach((button) => {
            button.addEventListener('click', viewEnterprise);
        });

        // Atualiza os botões de paginação
        updatePaginationButtons(params.page);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar empresas. Tente novamente.');
    }
}

// Função para redirecionar para a página da empresa
function viewEnterprise(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da empresa
    window.location.href = `empresa.html?id=${id}`; // Redireciona para empresa.html com o ID
}

// Função para atualizar uma empresa
async function updateEnterprise(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da empresa

    // Solicita ao usuário os novos dados da empresa
    const nome = prompt('Novo nome da empresa:');
    const cnpj = prompt('Novo CNPJ:');
    const email = prompt('Novo email:');

    if (!nome || !cnpj || !email) {
        alert('Todos os campos são obrigatórios!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/updateEnterprise/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, cnpj, email }),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar empresa');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de empresas após a atualização
        loadEnterprises();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar empresa. Tente novamente.');
    }
}

// Função para deletar uma empresa
async function deleteEnterprise(event) {
    const id = event.target.getAttribute('data-id'); // Obtém o ID da empresa

    try {
        const response = await fetch('http://localhost:3000/api/deleteEnterprise', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }), // Envia o ID no corpo da requisição
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir empresa');
        }

        const result = await response.json();
        alert(result.message); // Exibe a mensagem de sucesso

        // Recarrega a lista de empresas após a exclusão
        loadEnterprises();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir empresa. Tente novamente.');
    }
}

// Função para adicionar uma empresa
async function addEnterprise(event) {
    event.preventDefault();
    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const cnpj = document.getElementById('cnpj').value;

    try {
        const response = await fetch('http://localhost:3000/api/addEnterprise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, cnpj }),
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar empresa');
        }

        loadEnterprises(); // Recarrega a lista após adicionar
        document.getElementById('addEnterpriseForm').reset(); // Limpa o formulário
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar empresa. Tente novamente.');
    }
}

// Função para buscar empresas
async function searchEnterprise(event) {
    event.preventDefault();
    const searchName = document.getElementById('searchName').value;
    const searchCnpj = document.getElementById('searchCnpj').value;
    const searchEmail = document.getElementById('searchEmail').value;

    // Cria um objeto com os parâmetros de busca
    const searchParams = {};
    if (searchName) searchParams.nome = searchName;
    if (searchCnpj) searchParams.cnpj = searchCnpj;
    if (searchEmail) searchParams.email = searchEmail;

    // Carrega as empresas com base nos parâmetros de busca
    loadEnterprises(searchParams);
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
    const searchCnpj = document.getElementById('searchCnpj').value;
    const searchEmail = document.getElementById('searchEmail').value;

    // Cria um objeto com os parâmetros de busca e a nova página
    const searchParams = { page: newPage };
    if (searchName) searchParams.nome = searchName;
    if (searchCnpj) searchParams.cnpj = searchCnpj;
    if (searchEmail) searchParams.email = searchEmail;

    // Carrega as empresas com base nos parâmetros de busca e na nova página
    loadEnterprises(searchParams);
}

// Eventos
document
    .getElementById('addEnterpriseForm')
    .addEventListener('submit', addEnterprise);

document
    .getElementById('searchEnterpriseForm')
    .addEventListener('submit', searchEnterprise);

// Carregar empresas ao iniciar
loadEnterprises();