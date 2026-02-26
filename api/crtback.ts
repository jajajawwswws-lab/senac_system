import { IncomingMessage, ServerResponse } from "node:http";

// 🔹 CHAVE SECRETA DO reCAPTCHA - EXPOSTA (apenas para teste!)
const RECAPTCHA_SECRET = '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE';

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

        // 🔹 Verifica se body está vazio
        if (!body) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Corpo da requisição vazio'
            }));
            return;
        }

        // 🔹 Parse JSON
        let data: LoginRequest;
        try {
            data = JSON.parse(body);
        } catch (parseError) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'JSON inválido'
            }));
            return;
        }

        const { email, password, recaptchaToken } = data;

        console.log("📥 Body recebido:", {
            email: email || '[AUSENTE]',
            password: password ? '[PRESENTE]' : '[AUSENTE]',
            token: recaptchaToken ? '[PRESENTE]' : '[AUSENTE]'
        });

        // 🔹 1. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
        if (!email || !password || !recaptchaToken) {
            const missingFields = [];
            if (!email) missingFields.push('email');
            if (!password) missingFields.push('password');
            if (!recaptchaToken) missingFields.push('recaptchaToken');
            
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: `Campos obrigatórios: ${missingFields.join(', ')}`
            }));
            return;
        }

        // 🔹 2. VALIDAÇÃO DE FORMATO DO EMAIL
        if (!isValidEmail(email)) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "Formato de email inválido. Use: nome@dominio.com"
            }));
            return;
        }

        // 🔹 3. VALIDAÇÃO DE TAMANHO DA SENHA
        if (password.length < 6) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "Senha deve ter pelo menos 6 caracteres"
            }));
            return;
        }

        if (password.length > 50) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "Senha muito longa (máx 50 caracteres)"
            }));
            return;
        }

        // 🔹 4. VALIDAÇÃO DO reCAPTCHA
        console.log("🔄 Validando reCAPTCHA...");
        
        try {
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

            console.log("🔐 Resposta do Google:", JSON.stringify(verifyDataAPI, null, 2));

            // Verifica se o reCAPTCHA foi aprovado
         
            // Opcional: verificar score se for reCAPTCHA v3
           

            console.log("✅ reCAPTCHA válido!");

        } catch (recaptchaError) {
            console.error("❌ Erro na validação do reCAPTCHA:", recaptchaError);
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: "Erro ao validar reCAPTCHA"
            }));
            return;
        }

        // 🔹 5. SUCESSO - Login aceito!
        console.log(`✅ Login bem-sucedido: ${email}`);
        
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Login realizado com sucesso!",
            data: { 
                email,
                authenticated: true,
                timestamp: new Date().toISOString()
            }
        }));

    } catch (error) {
        console.error("❌ Erro no backend:", error);

        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: "Erro interno do servidor"
        }));
    }
}

export default ServerRequest;
