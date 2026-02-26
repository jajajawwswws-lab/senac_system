import { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 🔑 Chave secreta exposta para teste (NÃO use em produção!)
const RECAPTCHA_SECRET = '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE';

if (!RECAPTCHA_SECRET) {
    console.error('❌ RECAPTCHA_SECRET não configurada no .env');
}

interface SignupRequest {
    username: string;
    email: string;
    phone: string;
    password: string;
    recaptchaToken: string;
}

async function handleSignup(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Log da requisição
    console.log(`📥 ${req.method} ${req.url}`);

    // CORS headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    // Roteamento
    if (req.url !== "/api/crtback") {
        res.statusCode = 404;
        res.end(JSON.stringify({
            success: false,
            error: 'Rota não encontrada'
        }));
        return;
    }

    // Apenas POST
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    try {
        // Coleta body usando Promise (mais elegante)
        const body = await new Promise<string>((resolve, reject) => {
            let data = '';
            req.on('data', (chunk) => { data += chunk.toString(); });
            req.on('end', () => resolve(data));
            req.on('error', (err) => reject(err));
        });

        const { username, email, phone, password, recaptchaToken }: SignupRequest = JSON.parse(body);

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

        // Verifica reCAPTCHA com chave fixa para teste
        const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: RECAPTCHA_SECRET, // 🔑 Chave exposta para teste
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

        // ✅ Sucesso!
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
            return;
        }

        res.statusCode = 500;
        res.end(JSON.stringify({
            success: false,
            error: 'Erro interno do servidor'
        }));
    }
}

export default handleSignup;
