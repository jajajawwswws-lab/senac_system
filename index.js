// index.js
async function enviarFormulario(event) {
    event.preventDefault();
    
    // ✅ PEGAR O ELEMENTO CORRETAMENTE
    const resultado = document.getElementById('resultado');
    
    try {
        resultado.textContent = '🔄 Enviando...';
        
        // Pegar token do reCAPTCHA
        const token = grecaptcha.getResponse();
        
        if (!token) {
            resultado.textContent = '6LcvXCEsAAAAAD8UP8FtA29Anwpeq7AhiVWZQ_fQ';
            return;
        }

        // ✅ CHAMADA CORRETA PARA API
        const response = await fetch('https://senac-system.vercel.app/api/backend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                recaptchaToken: token
            })
        });

        // ✅ VERIFICAR STATUS
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // ✅ AWAIT no json()
        const dados = await response.json();
        
        if (dados.sucesso) {
            resultado.innerHTML = '✅ Enviado com sucesso!';
            grecaptcha.reset();
        } else {
            resultado.innerHTML = '❌ Erro: ' + dados.erro;
        }

    } catch (erro) {
        console.error('Erro completo:', erro);
        resultado.innerHTML = '❌ Erro: ' + erro.message;
    }
}

// ✅ DEFINIR A FUNÇÃO GLOBALMENTE
window.enviarFormulario = enviarFormulario;
