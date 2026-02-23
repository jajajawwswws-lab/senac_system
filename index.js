// ===============================
// Validação de campos
// ===============================
function validarCampos(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("Digite um e-mail válido.");
        return false;
    }

    if (password.length < 9) {
        alert("A senha deve conter pelo menos 9 caracteres.");
        return false;
    }

    return true;
}


// ===============================
// Callback chamado pelo reCAPTCHA
// ===============================
function onSubmit(token) {

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const resultado = document.getElementById('resultado');

    // Validação antes de enviar
    if (!validarCampos(email, password)) {
        return;
    }

    resultado.style.color = "black";
    resultado.textContent = "🔄 Verificando...";

    // Enviar para o backend
    fetch('/api/backend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            recaptchaToken: token
        })
    })
    .then(response => response.json())
    .then(data => {

        console.log("Resposta do backend:", data);

        if (data.success) {

            resultado.style.color = "green";
            resultado.textContent = "✅ Login realizado com sucesso!";

            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = "account.html";
            }, 1000);

        } else {

            resultado.style.color = "red";
            resultado.textContent = data.error || "E-mail ou senha incorretos!";
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        resultado.style.color = "red";
        resultado.textContent = "❌ Erro de conexão com o servidor.";
    });
}


// ===============================
// Tornar função global para o reCAPTCHA
// ===============================
window.onSubmit = onSubmit;


// ===============================
// Impedir envio padrão do formulário
// ===============================
document.getElementById('loginForm')
    .addEventListener('submit', function(event) {
        event.preventDefault();
        // O reCAPTCHA irá chamar onSubmit automaticamente
});
