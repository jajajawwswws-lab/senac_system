document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('registrationForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitButton = document.getElementById('submitButton');

    const API_URL = 'https://senac-system.vercel.app/api/crtback';

    let isFormValid = {
        email: false,
        password: false,
        confirmPassword: false
    };

    function updateSubmitButton() {
        const allValid = isFormValid.email &&
                         isFormValid.password &&
                         isFormValid.confirmPassword;

        submitButton.disabled = !allValid;
    }

    // 🔹 Email
    emailInput.addEventListener('input', function () {
        const email = this.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        isFormValid.email = emailPattern.test(email);
        updateSubmitButton();
    });

    // 🔹 Password
    passwordInput.addEventListener('input', function () {
        const password = this.value;

        isFormValid.password = password.length >= 6 && password.length <= 50;
        checkPasswordMatch();
        updateSubmitButton();
    });

    // 🔹 Confirm Password
    confirmPasswordInput.addEventListener('input', function () {
        checkPasswordMatch();
        updateSubmitButton();
    });

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        isFormValid.confirmPassword =
            confirmPassword.length > 0 &&
            password === confirmPassword;
    }

    // 🔹 Submit
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (submitButton.disabled) {
            alert('Preencha os campos corretamente.');
            return;
        }

        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';

        try {

            if (!navigator.onLine) {
                throw new Error('Sem internet');
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Erro na requisição');
            }

            alert('✅ Login realizado com sucesso!');

            form.reset();

            setTimeout(() => {
                window.location.href = result.data.redirect;
            }, 1000);

        } catch (error) {

            console.error('Erro:', error);
            alert('❌ ' + error.message);

            submitButton.disabled = false;
            submitButton.textContent = originalText;
            updateSubmitButton();
        }
    });

});
