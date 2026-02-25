import { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import path from "path";

// 🔹 CARREGAR .env do local correto
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Carregando .env de:', envPath);

dotenv.config({ path: envPath });

// 🔹 Verificar se carregou
if (!process.env["RECAPTCHA_SECRET"]) {
    console.error('❌ RECAPTCHA_SECRET não encontrada!');
    console.log('📁 Caminho procurado:', envPath);
    console.log('📄 Variáveis disponíveis:', Object.keys(process.env));
}

// Interface do corpo esperado
interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken: string;
}

// Função para validar email com regex
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function ServerRequest(
    request: IncomingMessage,
    response: ServerResponse
): Promise<void> {

    // 🔹 Headers CORS
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 🔹 Preflight
    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    // 🔹 Apenas POST permitido
    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    try {
        // 🔹 Coleta do body
        let body = '';

        await new Promise<void>((resolve, reject) => {
            request.on('data', chunk => { body += chunk.toString(); });
            request.on('end', () => resolve());
            request.on('error', err => reject(err));
        });

        // 🔹 Parse JSON
        const data: LoginRequest = JSON.parse(body);

        const { email, password, recaptchaToken } = data;

        console.log("Body recebido:", {
            email,
            password: password ? "[PRESENT]" : "[MISSING]",
            token: recaptchaToken ? "[PRESENT]" : "[MISSING]"
        });

        // 🔹 Campos obrigatórios
        if (!email || !password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos'
            }));
            return;
        }

        // 🔹 Verifica reCAPTCHA - AGORA FUNCIONA!
        const RECAPTCHA_SECRET = process.env["RECAPTCHA_SECRET"];

        if (!RECAPTCHA_SECRET) {
            console.error("❌ RECAPTCHA_SECRET não configurada no .env");
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: "Erro de configuração do servidor"
            }));
            return;
        }

        const verifyAPI = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    secret: RECAPTCHA_SECRET,
                    response: recaptchaToken
                })
            }
        );

        const verifyDataAPI = await verifyAPI.json();

        console.log("Resposta Google:", verifyDataAPI);

        // 🔹 VERIFICAÇÃO CORRETA do reCAPTCHA
        if (!verifyDataAPI) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido'
            }));
            return;
        }

        console.log("✅ reCAPTCHA válido ✔");

        // 🔹 VALIDAÇÃO de email e senha
        if (!isValidEmail(email)) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "Formato de email inválido"
            }));
            return;
        }

        if (password.length < 6) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "Senha deve ter pelo menos 6 caracteres"
            }));
            return;
        }

        // 🔹 Exemplo de validação (substitua pelo seu banco)
        const VALID_EMAIL = "teste@email.com";
        const VALID_PASSWORD = "123456";

        if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: "Credenciais inválidas"
            }));
            return;
        }

        // ✅ Sucesso
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Login realizado com sucesso!",
            data: { 
                email,
                authenticated: true
            }
        }));

    } catch (error) {
        console.error("Erro no backend:", error);

        if (error instanceof SyntaxError) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "JSON inválido"
            }));
            return;
        }

        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: "Erro interno do servidor"
        }));
    }
}

export default ServerRequest;
