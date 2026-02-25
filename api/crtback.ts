import { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import path from "path";

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

if (!RECAPTCHA_SECRET) {
    console.error('❌ RECAPTCHA_SECRET não configurada no .env');
}

interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken: string;
}

async function ServerRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    // CORS headers
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight
    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    // Apenas POST
    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    try {
        // Coleta body
        let body = '';
        const bodyData = await new Promise<string>((resolve, reject) => {
            request.on('data', (chunk) => { body += chunk.toString(); });
            request.on('end', () => resolve(body));
            request.on('error', (err) => reject(err));
        });

        const data: LoginRequest = JSON.parse(bodyData);
        const { email, password, recaptchaToken } = data;

        console.log('📧 Email:', email);

        // Valida campos obrigatórios
        if (!email || !password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos'
            }));
            return;
        }

        // 🔐 Verifica reCAPTCHA com chave do .env
        if (!RECAPTCHA_SECRET) {
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: 'Erro de configuração do servidor'
            }));
            return;
        }

        const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: RECAPTCHA_SECRET, // ✅ Agora seguro!
                response: recaptchaToken
            })
        });

        const verifyDataAPI = await verifyAPI.json();

        if (!verifyDataAPI.success) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido'
            }));
            return;
        }

        console.log('✅ reCAPTCHA válido');

        // Verifica credenciais (exemplo fixo)
        if (email !== "senac@gmail.com" || password !== "senacoficialmnbvcxz321#@!") {
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: "Credenciais inválidas"
            }));
            return;
        }

        // Sucesso
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: 'Login realizado com sucesso!',
            data: { email }
        }));

    } catch (error) {
        console.error('❌ Erro:', error);

        if (error instanceof SyntaxError) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'JSON inválido'
            }));
            return;
        }

        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: 'Erro interno do servidor'
        }));
    }
}

export default ServerRequest;
