// create_account.js - VERSÃO CORRIGIDA

document.addEventListener('DOMContentLoaded', function() {
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

    // 🔑 CHAVE DO SITE reCAPTCHA
    const RECAPTCHA_SITE_KEY = '6LeJZ28sAAAAAMgcIEAe0vm2GHIKZUZRucVyeiYU';
    
    // ✅ URL CORRETA - sem barra no final
    const API_URL = 'https://senac-system.vercel.app/api/crtback';
    
    // Validação em tempo real
    let isFormValid = {
        username: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    };

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
    
    // Validação e formatação de telefone
    phoneInput.addEventListener('input', function() {
        clearFieldError(this);
        
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
        
        const digitCount = phoneDigits.length;
        
        if (digitCount >= 10 && digitCount <= 11) {
            // Regex simplificado para telefone brasileiro
            const regex_phone = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
            
            if (!regex_phone.test(this.value)) {
                showFieldError(this, 'Please use format: (DDD) 99999-9999');
                isFormValid.phone = false;
            } else {
                clearFieldError(this);
                isFormValid.phone = true;
            }
        } else {
            showFieldError(this, 'Phone must have 10 or 11 digits');
            isFormValid.phone = false;
        }
        
        updateSubmitButton();
    });

    // Validação de força da senha
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        
        if (passwordStrengthDiv) {
            passwordStrengthDiv.classList.remove('hidden');
        }
        
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
        
        if (password.length < 8) {
            showFieldError(this, 'Password must be at least 8 characters');
            isFormValid.password = false;
        } else {
            clearFieldError(this);
            isFormValid.password = true;
        }
        
        checkPasswordMatch();
        updateSubmitButton();
    });

    // Validação de confirmação de senha
    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
        updateSubmitButton();
    });

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

    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        
        // Critérios de força
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        // Ajusta para escala de 1-5
        return Math.min(Math.max(score, 1), 5);
    }

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

    function showFieldError(inputElement, message) {
        // Remove erro anterior se existir
        clearFieldError(inputElement);
        
        inputElement.classList.add('border-red-500');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-600 text-sm mt-1';
        errorDiv.textContent = message;
        
        inputElement.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('border-red-500');
        
        // Remove todas as mensagens de erro deste input
        const parent = inputElement.parentNode;
        const errorMessages = parent.querySelectorAll('.text-red-600');
        errorMessages.forEach(msg => msg.remove());
    }

    function updateSubmitButton() {
        // Verifica se TODOS os campos são válidos
        const allValid = isFormValid.username && 
                        isFormValid.email && 
                        isFormValid.phone &&  // ✅ Adicionado phone que estava faltando
                        isFormValid.password && 
                        isFormValid.confirmPassword;
        
        submitButton.disabled = !allValid;
        
        if (allValid) {
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
            submitButton.classList.add('cursor-pointer');
            submitButton.style.backgroundColor = '#FAA628';
        } else {
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
            submitButton.classList.remove('cursor-pointer');
            submitButton.style.backgroundColor = '#D1D5DB';
        }
    }

    // ENVIO DO FORMULÁRIO
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!submitButton.disabled) {
            // Desabilitar botão e mostrar loading
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<span class="spinner"></span> Creating account...';
            
            try {
                // Verificar se reCAPTCHA está carregado
                if (typeof grecaptcha === 'undefined' || !grecaptcha.execute) {
                    throw new Error('reCAPTCHA not loaded');
                }
                
                // Executar reCAPTCHA
                console.log('🔄 Executando reCAPTCHA...');
                const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'register'});
                console.log('✅ Token obtido:', token.substring(0, 20) + '...');
                
                // Preparar dados
                const userData = {
                    username: usernameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.replace(/\D/g, ''), // Remove formatação
                    password: passwordInput.value,
                    recaptchaToken: token
                };
                
                console.log('📤 Enviando dados para:', API_URL);
                
                // Enviar para o backend
                const respostaBackend = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                });

                // Primeiro pegar como texto para debug
                const textResponse = await respostaBackend.text();
                console.log('📥 Resposta bruta:', textResponse);

                // Tentar parsear como JSON
                let resultado;
                try {
                    resultado = JSON.parse(textResponse);
                } catch (e) {
                    console.error('❌ Resposta não é JSON válido:', textResponse);
                    throw new Error('Invalid server response');
                }

                if (!respostaBackend.ok || !resultado.success) {
                    throw new Error(resultado.error || 'Server error');
                }
                
                // Sucesso!
                alert("✅ Account created successfully!");
                form.reset();
                
                // Redirecionar após sucesso
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
                
            } catch (error) {
                console.error('❌ Erro detalhado:', error);
                
                // Mensagens de erro amigáveis
                let errorMessage = '❌ Registration failed. ';
                
                if (!navigator.onLine) {
                    errorMessage = '❌ No internet connection. Please check your network.';
                } else if (error.message === 'reCAPTCHA not loaded') {
                    errorMessage = '❌ Security verification failed. Please refresh the page.';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = '❌ Server unavailable. Please try again later.';
                } else if (error.message.includes('reCAPTCHA')) {
                    errorMessage = '❌ Invalid reCAPTCHA. Please try again.';
                } else {
                    errorMessage = '❌ ' + (error.message || 'Please try again.');
                }
                
                alert(errorMessage);
                
                // Restaurar botão
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                updateSubmitButton();
            }
        } else {
            alert('Please fill all required fields correctly.');
        }
    });

    // Validação inicial
    setTimeout(() => {
        // Trigger eventos para validação inicial
        usernameInput.dispatchEvent(new Event('input'));
        emailInput.dispatchEvent(new Event('input'));
        phoneInput.dispatchEvent(new Event('input'));
        passwordInput.dispatchEvent(new Event('input'));
        confirmPasswordInput.dispatchEvent(new Event('input'));
    }, 100);
});
