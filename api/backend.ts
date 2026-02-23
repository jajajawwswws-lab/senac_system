import { IncomingMessage, ServerResponse } from "node:http";

interface Registro {
    id: number;
    nome: string;
    email: string;
    recaptchaToken: string;
}
async function ServerRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    // Verificar método
    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({
            success: false,
            error: 'Método não permitido no sistema'
        }));
        return;
    }request.on('end', async () => {
    try {
        const data = JSON.parse(body) as Registro;
        const { nome, email, recaptchaToken } = data;

        if (!nome || !email || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios faltando'
            }));
            return;
        }

        const verifyAPI = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                //6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE
                body: new URLSearchParams({
                    secret: '6Lblabla',
                    response: recaptchaToken
                })
            }
        );

        const verifyDataAPI = await verifyAPI.json();

        if (!verifyDataAPI.success) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido'
            }));
            return;
        }

        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: 'Formulário enviado com sucesso!',
            dados: { nome, email }
        }));

    } catch (error) {
        response.statusCode = 400;
        response.end(JSON.stringify({
            success: false,
            error: 'JSON inválido'
        }));
    }
});

async function Handler(req: Registro, res: Registro): Promise<string> {
    return `User ${req.nome} and ${res.email}`;
}

export type { ServerRequest };
export type { Handler };
