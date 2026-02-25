import { IncomingMessage, ServerResponse } from "node:http";
//import proxy from "./proxy";
import { clerkMiddleware } from "@clerk/nextjs/server";
//import dotenv from "dotenv";

//dotenv.config(); // Lê variáveis de ambiente do .env



clerkMiddleware();
// Interface do corpo esperado
interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken: string;
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

        // 🔹 Verifica reCAPTCHA
        const RECAPTCHA_SECRET = '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE';

        if (!RECAPTCHA_SECRET) throw new Error("Chave reCAPTCHA não configurada");

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

        if (!verifyDataAPI) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido',
            
            }));
            return;
        }

        // 🔹 Validação extra para v3
        /*
        if (verifyDataAPI !== undefined) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Score do reCAPTCHA muito baixo',
                score: verifyDataAPI
            }));
            return;
        }*/
     
        console.log("Passou o methodo Post valido para a api recaptcha . . . :)");
        console.log("reCAPTCHA válido ✔");

        // 🔹 Validação de login (exemplo fixo)
        if (email !== "senac@gmail.com" || password !== "senacoficialmnbvcxz321#@!") {
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
            data: { email }
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
