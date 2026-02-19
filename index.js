// index.js - Função de callback chamada pelo reCAPTCHA
function onSubmit(token) {
    console.log('Token recebido:', token);
    
    // Pegar dados do formulário
    //const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const resultado = document.getElementById('resultado');
    const password = document.getElementById('password').value.trim();
    resultado.textContent = '🔄 Enviando...';
    
    // Preparar dados para enviar
    const dados = {
        email: email,
        password: password,
        recaptchaToken: token
    };
    
    // Enviar para o backend
    fetch('/api/backend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            resultado.innerHTML = '✅ Enviado com sucesso!';
            document.getElementById('loginForm').reset();
        } else {
            resultado.innerHTML = '❌ Erro: ' + (data.erro || 'Erro desconhecido');
        }
    })
    .catch(erro => {
        console.error('Erro:', erro);
        resultado.innerHTML = '❌ Erro de conexão: ' + erro.message;
    });
}

// Tornar função global para ser acessível pelo reCAPTCHA
window.onSubmit = onSubmit;

// Prevenir envio padrão do formulário
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // O reCAPTCHA vai chamar onSubmit automaticamente
});

function validadeCampos(password,email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email))
        {
            alert("Digite um e-mail valido");
            return false;
        }
    if(password.length < 9)
        {
            alert("Deve pelo menos conter 9 caracteres. ");
            return false;
        }
    password.length
        return true;
        
}
