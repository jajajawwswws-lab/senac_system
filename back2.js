const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da sessão
app.use(session({
    secret: 'seu-secret-aqui', // Altere para um secret seguro
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Altere para true se usar HTTPS
}));

// Endpoint de login
app.post('/login', async (req, res) => {
    try {
        // 1. Verificar se o token existe
        if (!req.body['g-recaptcha-response']) {
            return res.json({
                sucesso: false,
                erro: 'Token reCAPTCHA não recebido'
            });
        }

        // 2. Validar reCAPTCHA
        const recaptcha_secret = "6LcvXCEsAAAAALhdjN9brcMVR33i5aQwspMOWXv9";
        const recaptcha_response = req.body['g-recaptcha-response'];

        try {
            const recaptchaResponse = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${recaptcha_secret}&response=${recaptcha_response}`,
                { method: 'POST' }
            );
            
            const recaptcha_data = await recaptchaResponse.json();

            if (!recaptcha_data.success || recaptcha_data.score < 0.5) {
                return res.json({
                    sucesso: false,
                    erro: 'Falha na verificação do reCAPTCHA',
                    score: recaptcha_data.score || 0
                });
            }

            // 3. Verificar credenciais
            const email = req.body.email || '';
            const senha = req.body.password || '';

            // 🔥 EXEMPLO — substitua pelo banco
            const login_valido = (email === "teste@email.com" && senha === "123456");

            if (login_valido) {
                req.session.usuario = email;

                return res.json({
                    sucesso: true,
                    login_valido: true,
                    score: recaptcha_data.score
                });
            } else {
                return res.json({
                    sucesso: true,
                    login_valido: false,
                    erro: 'Credenciais inválidas',
                    score: recaptcha_data.score
                });
            }
        } catch (fetchError) {
            return res.json({
                sucesso: false,
                erro: 'Falha ao conectar ao Google'
            });
        }
    } catch (error) {
        return res.json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
