// index.js
async function enviarFormulario(event) {
    event.preventDefault();
    
    // PEGAR O ELEMENTO RESULTADO
    const resultado = document.getElementById('resultado');
    
    try {
        resultado.textContent = '🔄 Enviando...';
        
        // VALIDAR CAMPOS
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        
        if (!nome || !email) {
            resultado.textContent = '❌ Preencha todos os campos';
            return;
        }
        
        // PEGAR TOKEN DO RECAPTCHA
        const token = grecaptcha.getResponse();
        
        // ✅ CORRIGIDO: Mensagem de erro, NÃO a chave!
        if (!token) {
            resultado.textContent = '❌ Por favor, complete o reCAPTCHA';
            return;
        }

        // CHAMAR API
        const response = await fetch('/api/backend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                recaptchaToken: token
            })
        });

        // VERIFICAR STATUS
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // CONVERTER RESPOSTA
        const dados = await response.json();
        
        // PROCESSAR RESULTADO
        if (dados.sucesso) {
            resultado.innerHTML = '✅ Enviado com sucesso!';
            // LIMPAR CAMPOS
            document.getElementById('nome').value = '';
            document.getElementById('email').value = '';
            grecaptcha.reset();
        } else {
            resultado.innerHTML = '❌ Erro: ' + (dados.erro || 'Erro desconhecido');
        }

    } catch (erro) {
        console.error('Erro completo:', erro);
        resultado.innerHTML = '❌ Erro: ' + erro.message;
    }
}

// TORNAR FUNÇÃO GLOBAL
window.enviarFormulario = enviarFormulario;
