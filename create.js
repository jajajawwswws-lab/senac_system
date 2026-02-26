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
    const API_URL = 'https://senac-system.vercel.app/api/crtback';

    // Estado do formulário
    let isFormValid = {
        username: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    };

    // ==================== FUNÇÕES UTILITÁRIAS ====================

    function showFieldError(inputElement, message) {
        clearFieldError(inputElement);
        
        inputElement.classList.add('border-red-500');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mt-1 text-sm text-red-600 fade-in';
        errorDiv.textContent = message;
        
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('border-red-500');
        
        const errorDiv = inputElement.parentNode.querySelector('.text-red-600');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    function updateSubmitButton() {
        const allValid = isFormValid.username && 
                        isFormValid.email && 
                        isFormValid.phone &&  // Adicionado phone
                        isFormValid.password && 
                        isFormValid.confirmPassword;
        
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

    // ==================== FUNÇÕES DE VALIDAÇÃO ====================

    // Username
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

    // Email
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

    // Telefone - Versão simplificada
    phoneInput.addEventListener('input', function() {
        clearFieldError(this);
        
        // Remove tudo que não é dígito
        let phoneDigits = this.value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        if (phoneDigits.length > 11) {
            phoneDigits = phoneDigits.slice(0, 11);
        }
        
        // Formata o telefone
        if (phoneDigits.length <= 10) {
            // Formato (XX) XXXX-XXXX para telefone fixo
            if (phoneDigits.length > 2) {
                phoneDigits = '(' + phoneDigits.substring(0, 2) + ') ' + 
                              phoneDigits.substring(2, 6) + '-' + 
                              phoneDigits.substring(6, 10);
            }
        } else {
            // Formato (XX) 9XXXX-XXXX para celular
            if (phoneDigits.length > 2) {
                phoneDigits = '(' + phoneDigits.substring(0, 2) + ') ' + 
                              phoneDigits.substring(2, 7) + '-' + 
                              phoneDigits.substring(7, 11);
            }
        }
        
        this.value = phoneDigits;
        
        // Validação
        const digitCount = this.value.replace(/\D/g, '').length;
        
        if (digitCount < 10 || digitCount > 11) {
            showFieldError(this, 'Phone must have 10 or 11 digits');
            isFormValid.phone = false;
        } else {
            isFormValid.phone = true;
        }
        
        updateSubmitButton();
    });

    // Senha
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        
        if (passwordStrengthDiv) {
            passwordStrengthDiv.classList.remove('hidden');
        }
        
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
        
        if (password.length < 6) { // Mudado para 6 para combinar com backend
            showFieldError(this, 'Password must be at least 6 characters');
            isFormValid.password = false;
        } else if (password.length > 50) {
            showFieldError(this, 'Password cannot exceed 50 characters');
            isFormValid.password = false;
        } else {
            clearFieldError(this);
            isFormValid.password = true;
        }
        
        checkPasswordMatch();
        updateSubmitButton();
    });

    // Confirmar Senha
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
        
        if (password.length >= 6) score += 1;
        if (password.length >= 10) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
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

    // ==================== TOGGLE SENHA ====================

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

    // ==================== ENVIO DO FORMULÁRIO ====================

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!submitButton.disabled) {
            // Desabilitar botão e mostrar loading
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<span class="spinner"></span> Creating account...';
            
            try {
                // Verificar conexão com internet
                if (!navigator.onLine) {
                    throw new Error('NO_INTERNET');
                }

                // Verificar reCAPTCHA
                if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute !== 'function') {
                    throw new Error('RECAPTCHA_NOT_LOADED');
                }
                
                // Executar reCAPTCHA
                console.log('🔄 Executando reCAPTCHA...');
                const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'register'});
                
                if (!token) {
                    throw new Error('RECAPTCHA_FAILED');
                }
                
                console.log('✅ reCAPTCHA obtido');
                
                // Preparar dados
                const formData = {
                    username: usernameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value,
                    password: passwordInput.value,
                    recaptchaToken: token
                };
                
                console.log('📤 Enviando dados...');
                
                // Enviar para o backend
                const respostaBackend = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                const resultado = await respostaBackend.json();
                console.log('📥 Resposta:', resultado);

                // Verificar resposta
                if (!respostaBackend.ok) {
                    throw new Error(resultado.error || `HTTP ${respostaBackend.status}`);
                }
                
                if (!resultado.success) {
                    throw new Error(resultado.error || 'Registration failed');
                }
                
                // Sucesso!
                alert("✅ Account created successfully! Redirecting to login...");
                form.reset();
                
                // Redirecionar após breve delay
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
                
            } catch (error) {
                console.error('❌ Erro:', error);
                
                // Mensagens de erro amigáveis
                let errorMessage = '❌ Registration failed. ';
                
                if (!navigator.onLine || error.message === 'NO_INTERNET') {
                    errorMessage = '❌ No internet connection. Please check your network.';
                } else if (error.message === 'RECAPTCHA_NOT_LOADED') {
                    errorMessage = '❌ Security verification failed. Please refresh the page.';
                } else if (error.message === 'RECAPTCHA_FAILED') {
                    errorMessage = '❌ Failed to verify you are human. Please try again.';
                } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    errorMessage = '❌ Server unavailable. Please try again later.';
                } else if (error.message.includes('reCAPTCHA') || error.message.includes('captcha')) {
                    errorMessage = '❌ Invalid reCAPTCHA. Please try again.';
                } else if (error.message.includes('email')) {
                    errorMessage = '❌ Invalid email format.';
                } else if (error.message.includes('password')) {
                    errorMessage = '❌ Password must be at least 6 characters.';
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

    // ==================== VALIDAÇÃO INICIAL ====================

    setTimeout(() => {
        usernameInput.dispatchEvent(new Event('input'));
        emailInput.dispatchEvent(new Event('input'));
        phoneInput.dispatchEvent(new Event('input'));
        passwordInput.dispatchEvent(new Event('input'));
        confirmPasswordInput.dispatchEvent(new Event('input'));
    }, 100);
});
