async function enviarFormulario(event) {
    event.preventDefault();
    
    try {
        // Pegar token do reCAPTCHA
        const token = grecaptcha.getResponse();
        
        if (!token) {
            alert('Complete o reCAPTCHA');
            return;
        }

        // ✅ CRIAR OBJETO JSON (NÃO FormData)
        const dados = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            recaptchaToken: token
        };

        console.log('Enviando dados:', dados); // Debug

        // ✅ ENVIAR COMO JSON
        const response = await fetch('/api/backend', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json' // 👈 ESSENCIAL!
            },
            body: JSON.stringify(dados) // 👈 Converter para JSON string
        });

        // Verificar se a resposta é OK
        if (!response.ok) {
            const erroTexto = await response.text();
            console.error('Resposta de erro:', erroTexto);
            throw new Error(`HTTP ${response.status}`);
        }

        const resultado = await response.json();
        console.log('Resultado:', resultado);

        if (!resultado.sucesso) {
            alert('Erro: ' + resultado.erro);
            return;
        }

        alert('✅ Sucesso!');
        grecaptcha.reset();
        
    } catch (erro) {
        console.error('Erro completo:', erro);
        alert('Erro: ' + erro.message);
    }
}
