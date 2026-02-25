import { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import path from "path";

// Carrega .env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

if (!RECAPTCHA_SECRET) {
    console.error('❌ RECAPTCHA_SECRET não configurada');
}

interface RegisterRequest {
    username: string;
    email: string;
    phone: string;
    password: string;
    recaptchaToken: string;
}

async function ServerRequest(
    request: IncomingMessage,
    response: ServerResponse
): Promise<void> {

    // CORS
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

    // Verifica se é a rota correta
    if (request.url !== '/api/crtback') {
        response.statusCode = 404;
        response.end(JSON.stringify({
            success: false,
            error: 'Rota não encontrada'
        }));
        return;
    }

    try {
        // Coleta o body
        let body = '';
        await new Promise<void>((resolve, reject) => {
            request.on('data', chunk => { body += chunk.toString(); });
            request.on('end', () => resolve());
            request.on('error', reject);
        });

        const data: RegisterRequest = JSON.parse(body);
        const { username, email, phone, password, recaptchaToken } = data;

        console.log('📥 Dados recebidos:', { 
            username, 
            email, 
            phone,
            password: '***' 
        });

        // Validações básicas
        if (!username || !email || !phone || !password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Todos os campos são obrigatórios'
            }));
            return;
        }

        // Verifica reCAPTCHA
        if (!RECAPTCHA_SECRET) {
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: 'Erro de configuração do servidor'
            }));
            return;
        }

        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const verifyBody = new URLSearchParams({
            secret: RECAPTCHA_SECRET,
            response: recaptchaToken
        });

        const recaptchaResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: verifyBody
        });

        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success) {
            console.log('❌ reCAPTCHA inválido:', recaptchaData['error-codes']);
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido'
            }));
            return;
        }

        console.log('✅ reCAPTCHA válido');

        // Aqui você salvaria no banco de dados
        // Por enquanto, só simula sucesso

        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: 'Conta criada com sucesso!'
        }));

    } catch (error) {
        console.error('❌ Erro no backend:', error);
        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: 'Erro interno do servidor'
        }));
    }
}

export default ServerRequest;
