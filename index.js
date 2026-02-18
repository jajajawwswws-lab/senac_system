document.addEventListener("DOMContentLoaded", function() {
    
    console.log('teste ts jjs');
    emailjs.init("U4YsBQw1w9fYHGgnL");
    alert('two;');
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!validarCampos(email, password)) return;

        grecaptcha.ready(async function() {
            try {
                const token = await grecaptcha.execute('6LcvXCEsAAAAAD8UP8FtA29Anwpeq7AhiVWZQ_fQ', { action: 'submit' });

                const formData = new FormData(form);
                formData.append('g-recaptcha-response', token);

                // ✅ CORREÇÃO: Apontar para o servidor Node.js
                const respostaBackend = await fetch('https://senac-system.vercel.app/api/backend', {
                    method: "POST",
                    body: formData
                });
                const resultado = await respostaBackend.json();

                if (!resultado.sucesso) {
                    alert("⚠ Erro no reCAPTCHA: " + resultado.erro);
                    return;
                }

                // Verificar se o login foi válido
                if (!resultado.login_valido) {
                    alert("❌ " + resultado.erro);
                    return;
                }

                // Agora sim envia email
                await emailjs.send(
                    "service_woaqqdh",
                    "template_tg9sqd3",
                    { user_email: email }
                );

                alert("✅ Login validado! Score Google: " + resultado.score);
                window.location.href = "account.html";

            } catch (erro) {
                console.error("Erro:", erro);
                alert("❌ Ocorreu um erro inesperado: " + erro.message);
                resultado.textContent = "Erro: " + error.message;
            }
        });
    });
});
function validarCampos(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("❌ Digite um e-mail válido.");
        return false;
    }

    if (password.length < 6) {
        alert("❌ A senha deve ter pelo menos 6 caracteres.");
        return false;
    }

    return true;
}
console.log('teste ts jjs');
