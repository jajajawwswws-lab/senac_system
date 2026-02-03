// create_account.js - VERSÃO ATUALIZADA

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema inicializado');
    
    // Elementos do DOM
    const form = document.getElementById('registrationForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const passwordStrengthDiv = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const passwordMatchMessage = document.getElementById('passwordMatchMessage');
    const submitButton = document.getElementById('submitButton');


    form.addEventListener('submit', async function(e){
        e.preventDefault();

        grecaptcha.ready(async function(){
            
                const token = await grecaptcha.execute('6LcvXCEsAAAAALhdjN9brcMVR33i5aQwspMOWXv9', { action: 'submit' });
                formData.append('g-recaptcha-response', token);
                const respostaBackend = await fetch("create_account.php",{
                    method: "POST",
                    body: formData
                });

                const resultado = await respostaBackend.json();

                if(!resultado.sucesso){
                    alert("⚠ Erro no reCAPTCHA: " + resultado.erro);
                    return;
                }
                
                alert("✅ Login validado! Score Google: " + resultado.score);
                window.location.href = "index.html";

            
        });
    });
    console.log('Elementos encontrados:', {
        form: !!form,
        usernameInput: !!usernameInput,
        submitButton: !!submitButton
    });

    // Validação em tempo real
    let isFormValid = {
        username: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    };

    // Verificar se reCAPTCHA está disponível
    if (typeof grecaptcha === 'undefined') {
        console.error('reCAPTCHA não carregado!');
    } else {
        console.log('reCAPTCHA disponível');
        grecaptcha.ready(function() {
            console.log('reCAPTCHA pronto');
        });
    }

    // Toggle de visibilidade da senha
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    // Validação de username
    usernameInput.addEventListener('input', function() {
        console.log('Username input:', this.value);
        const username = this.value.trim();
        const pattern = /^[a-zA-Z0-9_]+$/;
        
        if (username.length < 5) {
            showFieldError(this, 'Username must be at least 5 characters');
            isFormValid.username = false;
        } else if (username.length > 30) {
            showFieldError(this, 'Username cannot exceed 30 characters');
            isFormValid.username = false;
        } else if (!pattern.test(username)) {
            showFieldError(this, 'Only letters, numbers and underscores allowed');
            isFormValid.username = false;
        } else {
            clearFieldError(this);
            isFormValid.username = true;
        }
        updateSubmitButton();
    });

    // Validação de email
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showFieldError(this, 'Email is required');
            isFormValid.email = false;
        } else if (!emailPattern.test(email)) {
            showFieldError(this, 'Please enter a valid email address');
            isFormValid.email = false;
        } else {
            clearFieldError(this);
            isFormValid.email = true;
        }
        updateSubmitButton();
    });
    phoneInput.addEventListener('input', function() {
    // Remove erro enquanto digita
    clearFieldError(this);
    
    // Formatação
    const phoneDigits = this.value.replace(/\D/g, '');
    
    if (phoneDigits.length <= 11) {
        let formattedValue = phoneDigits;
        
        if (phoneDigits.length > 2) {
            formattedValue = '(' + phoneDigits.substring(0, 2) + ') ' + phoneDigits.substring(2);
        }
        
        if (phoneDigits.length > 7) {
            formattedValue = '(' + phoneDigits.substring(0, 2) + ') ' + 
                           phoneDigits.substring(2, 7) + '-' + 
                           phoneDigits.substring(7, 11);
        }
        
        this.value = formattedValue;
    }
    
    // Validação em tempo real, mas só mostra erro se já tiver digitado bastante
    const digitCount = phoneDigits.length;
    
    if (digitCount >= 10) {
        const regex_phone = /^\((68|82|96|92|97|71|73|74|75|77|85|88|61|27|28|62|64|98|99|65|66|67|31|32|33|34|35|37|38|91|93|94|83|41|42|43|44|45|46|81|87|86|89|21|22|24|84|51|53|54|55|69|95|47|48|49|11|12|13|14|15|16|17|18|19|79|63)\)\s?\d{4,5}-\d{4}$/;
        
        if (!regex_phone.test(this.value)) {
            showFieldError(this, 'Please use format: (DDD) 99999-9999');
            isFormValid.phone = false;
        } else {
            isFormValid.phone = true;
        }
    } else {
        isFormValid.phone = false;
    }
    
    updateSubmitButton();
});

    // Validação de força da senha
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        
        // Mostrar indicador de força                       
        if (passwordStrengthDiv) {
            passwordStrengthDiv.classList.remove('hidden');
        }
        
        // Calcular força
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
        
        // Validar comprimento mínimo
        if (password.length < 8) {
            showFieldError(this, 'Password must be at least 8 characters');
            isFormValid.password = false;
        } else {
            clearFieldError(this);
            isFormValid.password = true;
        }
        
        // Verificar correspondência com confirmação
        checkPasswordMatch();
        updateSubmitButton();
    });

    // Validação de confirmação de senha
    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
        updateSubmitButton();
    });

    // Função para verificar correspondência de senhas
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            if (passwordMatchMessage) {
                passwordMatchMessage.innerHTML = '';
            }
            confirmPasswordInput.style.borderColor = '';
            isFormValid.confirmPassword = false;
            return;
        }
        
        if (password === confirmPassword) {
            if (passwordMatchMessage) {
                passwordMatchMessage.innerHTML = '<span class="text-green-600">✓ Passwords match</span>';
            }
            confirmPasswordInput.style.borderColor = '#10B981';
            isFormValid.confirmPassword = true;
        } else {
            if (passwordMatchMessage) {
                passwordMatchMessage.innerHTML = '<span class="text-red-600">✗ Passwords do not match</span>';
            }
            confirmPasswordInput.style.borderColor = '#EF4444';
            isFormValid.confirmPassword = false;
        }
    }

    // Função para calcular força da senha
    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        
        // Comprimento
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Diversidade de caracteres
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        return Math.min(Math.max(score, 1), 5);
    }

    // Função para atualizar indicador de força
    function updatePasswordStrengthIndicator(strength) {
        if (!strengthBar || !strengthText) return;
        
        const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
        const texts = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
        
        const index = Math.max(0, Math.min(strength - 1, 4));
        const percentage = (strength / 5) * 100;
        
        strengthBar.style.width = `${percentage}%`;
        strengthBar.style.backgroundColor = colors[index];
        strengthText.textContent = texts[index];
        strengthText.style.color = colors[index];
    }

    // Função para mostrar erro no campo
    function showFieldError(inputElement, message) {
        clearFieldError(inputElement);
        
        // Adicionar classe de erro
        inputElement.classList.add('border-red-500');
        
        // Criar elemento de mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mt-1 text-sm text-red-600 fade-in';
        errorDiv.textContent = message;
        
        // Inserir após o campo
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }

    // Função para limpar erro do campo
    function clearFieldError(inputElement) {
        inputElement.classList.remove('border-red-500');
        
        // Remover mensagem de erro se existir
        const errorDiv = inputElement.parentNode.querySelector('.text-red-600');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Função para atualizar estado do botão de envio
    function updateSubmitButton() {
        console.log('Validando formulário:', isFormValid);
        
        // Verificar se todos os campos obrigatórios estão válidos
        // Telefone é tratado como opcional
        const allValid = isFormValid.username && 
                        isFormValid.email && 
                        isFormValid.password && 
                        isFormValid.confirmPassword;
        console.log('Todos válidos?', allValid);
        submitButton.disabled = !allValid;
        
        if (allValid) {
            submitButton.classList.add('bg-orange-400', 'hover:bg-orange-500', 'cursor-pointer');
            submitButton.classList.remove('bg-gray-300', 'cursor-not-allowed');
            submitButton.style.backgroundColor = '#FAA628';
        } else {
            submitButton.classList.add('bg-gray-300', 'cursor-not-allowed');
            submitButton.classList.remove('bg-orange-400', 'hover:bg-orange-500', 'cursor-pointer');
            submitButton.style.backgroundColor = '#D1D5DB';
        }
    }

    // Adicionar evento de clique direto no botão para debug
    submitButton.addEventListener('click', function(e) {
        console.log('Botão clicado!');
        console.log('Botão desabilitado?', this.disabled);
        
        if (this.disabled) {
            console.log('Por que está desabilitado?', {
                username: isFormValid.username,
                email: isFormValid.email,
                phone: isFormValid.phone,
                password: isFormValid.password,
                confirmPassword: isFormValid.confirmPassword
            });
            
            // Mostrar quais campos estão inválidos
            Object.keys(isFormValid).forEach(field => {
                if (!isFormValid[field]) {
                    console.log(`Campo ${field} está inválido`);
                }
            });
        }
    });

    // Envio do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Formulário submetido!');
        
        if (!submitButton.disabled) {
            console.log('Iniciando processo de criação de conta...');
            
            // Desabilitar botão durante o envio
            submitButton.disabled = true;
            submitButton.textContent = 'Creating account...';
            submitButton.style.backgroundColor = '#9CA3AF';
            
            try {
                // Verificar se reCAPTCHA está disponível
                if (typeof grecaptcha === 'undefined') {
                    throw new Error('reCAPTCHA não carregado');
                }
                
                console.log('Executando reCAPTCHA...');
                
                // Executar reCAPTCHA
                const token = await grecaptcha.execute('6LcvXCEsAAAAAD8UP8FtA29Anwpeq7AhiVWZQ_fQ', {action: 'register'});
                console.log('reCAPTCHA token obtido');
                
                // Coletar dados do formulário
                const formData = {
                    username: usernameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim() || null,
                    password: passwordInput.value,
                    recaptchaToken: token,
                    timestamp: new Date().toISOString()
                };
                
                console.log('Dados para envio:', { ...formData, password: '***' });
                
                // SIMULAÇÃO DE ENVIO - REMOVA ISSO QUANDO IMPLEMENTAR O BACKEND
                console.log('Simulando envio para o backend...');
                
                // Mostrar mensagem de carregamento
                const loadingMessage = document.createElement('div');
                loadingMessage.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                loadingMessage.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-xl">
                        <div class="flex items-center space-x-3">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <p class="text-lg">Creating your account...</p>
                        </div>
                    </div>
                `;
                document.body.appendChild(loadingMessage);
                
                // Simular delay de rede
                await new Promise(resolve => setTimeout(resolve, 1100));
                
                // Remover mensagem de carregamento
                loadingMessage.remove();
                
                // Simular resposta de sucesso
                console.log('Conta criada com sucesso');
                
                // Mostrar mensagem de sucesso
                alert('✅ Account created successfully!\n\nUsername: ' + formData.username + '\nEmail: ' + formData.email + '\n\nYou will be redirected to login page.');
                
                // Limpar formulário
                form.reset();
                
                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
            } catch (error) {
                console.error('Erro durante criação de conta:', error);
                
                // Mostrar mensagem de erro específica
                let errorMessage = 'Error creating account. ';
                
                if (error.message.includes('reCAPTCHA')) {
                    errorMessage += 'Please verify you are not a robot.';
                } else {
                    errorMessage += 'Please try again.';
                }
                
                alert('❌ ' + errorMessage);
                
                // Reativar botão
                submitButton.disabled = false;
                submitButton.textContent = 'Create your Estoque Senac account';
                updateSubmitButton();
            }
        } else {
            console.log('Botão desabilitado - formulário inválido');
            alert('Please fill all required fields correctly.');
            
            // Destacar campos inválidos
            if (!isFormValid.username) {
                usernameInput.focus();
                showFieldError(usernameInput, 'Please enter a valid username');
            } else if (!isFormValid.email) {
                emailInput.focus();
                showFieldError(emailInput, 'Please enter a valid email');
            } else if (!isFormValid.password) {
                passwordInput.focus();
                showFieldError(passwordInput, 'Password must be at least 8 characters');
            } else if (!isFormValid.confirmPassword) {
                confirmPasswordInput.focus();
                showFieldError(confirmPasswordInput, 'Passwords do not match');
            }
        }
    });

    // Forçar validação inicial
    console.log('Forçando validação inicial...');
    setTimeout(() => {
        usernameInput.dispatchEvent(new Event('input'));
        emailInput.dispatchEvent(new Event('input'));
        phoneInput.dispatchEvent(new Event('input'));
        passwordInput.dispatchEvent(new Event('input'));
        confirmPasswordInput.dispatchEvent(new Event('input'));
        console.log('Validação inicial completa');
    }, 100);

    // Adicionar logs para debug
    console.log('Script inicializado com sucesso');
});
