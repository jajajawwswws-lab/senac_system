import { IncomingMessage, ServerResponse } from "node:http";

// 🔹 CHAVE SECRETA DO reCAPTCHA - não usaremos mais
// const RECAPTCHA_SECRET = '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE';

// Interface do corpo esperado
interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken?: string; // Agora opcional
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

        const { email, password } = data; // Ignoramos o recaptchaToken

        console.log("📥 Body recebido:", {
            email: email || '[AUSENTE]',
            password: password ? '[PRESENTE]' : '[AUSENTE]'
        });

        // 🔹 1. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS (agora sem recaptcha)
        if (!email || !password) {
            const missingFields = [];
            if (!email) missingFields.push('email');
            if (!password) missingFields.push('password');
            
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

        // 🔹 4. PULAMOS VALIDAÇÃO DO reCAPTCHA COMPLETAMENTE
        console.log("⏭️ Validação do reCAPTCHA ignorada (modo desenvolvimento)");

        // 🔹 5. SUCESSO - Login aceito! SEMPRE VAI LOGAR
        console.log(`✅ Login bem-sucedido: ${email}`);
        
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Login realizado com sucesso!",
            data: { 
                email,
                authenticated: true,
                timestamp: new Date().toISOString(),
                redirect: "index.html" // Informa para onde redirecionar
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
