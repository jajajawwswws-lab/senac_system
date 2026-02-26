// ==================== ENVIO DO FORMULÁRIO ====================

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (submitButton.disabled) {
        alert('Please fill all required fields correctly.');
        return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<span class="spinner"></span> Creating account...';

    try {

        if (!navigator.onLine) {
            throw new Error('NO_INTERNET');
        }

        // 🔥 AGORA ENVIAMOS SOMENTE O QUE O BACKEND ESPERA
        const formData = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        console.log('📤 Enviando para backend:', formData);

        const respostaBackend = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const resultado = await respostaBackend.json();
        console.log('📥 Resposta:', resultado);

        if (!respostaBackend.ok || !resultado.success) {
            throw new Error(resultado.error || "Registration failed");
        }

        // ✅ COMO SEU BACKEND SEMPRE RETORNA SUCESSO:
        alert("✅ Account created successfully!");

        form.reset();

        setTimeout(() => {
            window.location.href = resultado.data?.redirect || "index.html";
        }, 1000);

    } catch (error) {

        console.error('❌ Erro:', error);

        let errorMessage = '❌ Registration failed.';

        if (error.message === 'NO_INTERNET') {
            errorMessage = '❌ No internet connection.';
        } else if (error.message.includes('email')) {
            errorMessage = '❌ Invalid email format.';
        } else if (error.message.includes('password')) {
            errorMessage = '❌ Password must be at least 6 characters.';
        }

        alert(errorMessage);

        submitButton.disabled = false;
        submitButton.textContent = originalText;
        updateSubmitButton();
    }
});
