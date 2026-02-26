
import http from "node:http";
import dotenv from "dotenv";
import path from "path";

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

if (!RECAPTCHA_SECRET) {
    console.error('❌ RECAPTCHA_SECRET não configurada no .env');
}

// Cria o servidor
const server = http.createServer((req, res) => {
    // Configura CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Log da requisição (útil para debug)
    console.log(`📥 ${req.method} ${req.url}`);

    // 🔹 Rota da API: /api/crtback
    if (req.url === "/api/crtback") {
        // Preflight OPTIONS
        if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
        }

        // Apenas POST permitido
        if (req.method !== "POST") {
            res.statusCode = 405;
            res.end(JSON.stringify({
                success: false,
                error: 'Método não permitido'
            }));
            return;
        }

        // Processa POST
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { username, email, phone, password, recaptchaToken } = data;

                console.log('📦 Dados recebidos:', { username, email, phone });

                // Valida campos obrigatórios
                if (!username || !email || !phone || !password || !recaptchaToken) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Todos os campos são obrigatórios'
                    }));
                    return;
                }

                // Verifica reCAPTCHA
                if (!RECAPTCHA_SECRET) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Erro de configuração do servidor'
                    }));
                    return;
                }

                const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        secret: RECAPTCHA_SECRET,
                        response: recaptchaToken
                    })
                });

                const verifyData = await verifyAPI.json();

                if (!verifyData.success) {
                    console.log('❌ reCAPTCHA inválido:', verifyData['error-codes']);
                    res.statusCode = 400;
                    res.end(JSON.stringify({
                        success: false,
                        error: 'reCAPTCHA inválido'
                    }));
                    return;
                }

                console.log('✅ reCAPTCHA válido');

                // ✅ Sucesso! (aqui você salvaria no banco)
                res.statusCode = 200;
                res.end(JSON.stringify({
                    success: true,
                    message: 'Conta criada com sucesso!',
                    data: { username, email }
                }));

            } catch (error) {
                console.error('❌ Erro:', error);
                
                if (error instanceof SyntaxError) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({
                        success: false,
                        error: 'JSON inválido'
                    }));
                } else {
                    res.statusCode = 500;
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Erro interno do servidor'
                    }));
                }
            }
        });

        return;
    }

    // Rota não encontrada
    res.statusCode = 404;
    res.end(JSON.stringify({
        success: false,
        error: 'Rota não encontrada'
    }));
});

// ✅ Exporta para Vercel (NÃO usa listen)
export default server;

