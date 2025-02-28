document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Faz a requisição para o endpoint de login
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
            // Salva o token JWT no localStorage
            localStorage.setItem('token', data.token);
            console.log(email)
            // Faz uma requisição para obter os dados do usuário, incluindo o tipo_usuario e o id
            const userResponse = await fetch(`http://localhost:3000/api/users?email=${email}`);

            const userData = await userResponse.json();

            if (userResponse.ok) {
                // Verifica o tipo de usuário e redireciona para a página correta
                console.log(userData[0].tipo_usuario)
                if (userData[0].tipo_usuario === 'admin') {
                    window.location.href = `/frontend/index.html`;
                } else if (userData[0].tipo_usuario === 'secretario' || userData[0].tipo_usuario[0] === 'funcionario') {
                    window.location.href = `/frontend/empresa.html?id=${userData[0].fk_empresa_id}`;
                } else {
                    // Redireciona para uma página padrão caso o tipo de usuário não seja reconhecido

                }
            } else {
                document.getElementById('error-message').textContent = userData.message || 'Erro ao obter dados do usuário';
            }
        } else {
            document.getElementById('error-message').textContent = data.message || 'Erro ao fazer login';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('error-message').textContent = 'Erro ao conectar ao servidor';
    }
});