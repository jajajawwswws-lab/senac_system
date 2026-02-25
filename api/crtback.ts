import { IncomingMessage, ServerResponse } from "node:http";
import { URLSearchParams } from "node:url";

async function Authentific(request: IncomingMessage, response: ServerResponse): Promise<void> {

    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({
            sucesso: false,
            erro: 'Método não permitido'
        }));
        return;
    }

    try {

        // 🔹 Ler o body como texto
        const buffers: Buffer[] = [];
        for await (const chunk of request) {
            buffers.push(chunk);
        }

        const rawBody = Buffer.concat(buffers).toString();

        // 🔹 Converter FormData (urlencoded)
        const formData = new URLSearchParams(rawBody);

        const username = formData.get("username");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const password = formData.get("password");
        const recaptchaToken = formData.get("g-recaptcha-response");

        if (!recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                sucesso: false,
                erro: "Token reCAPTCHA ausente"
            }));
            return;
        }

        // 🔐 Verificar reCAPTCHA no Google
        const googleResponse = await fetch(
            "https://www.google.com/recaptcha/api/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    secret_KEY: '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE',
                    response: recaptchaToken
                })
            }
        );

        const verifyData = await googleResponse.json();

        if (!verifyData.success) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                sucesso: false,
                erro: "reCAPTCHA inválido"
            }));
            return;
        }

        // ✅ Aqui você salvaria no banco

        response.statusCode = 200;
        response.end(JSON.stringify({
            sucesso: true,
            mensagem: "Conta criada com sucesso"
        }));

    } catch (error) {

        console.error("Erro no servidor:", error);

        response.statusCode = 500;
        response.end(JSON.stringify({
            sucesso: false,
            erro: "Erro interno do servidor"
        }));
    }
}

export default Authentific;
