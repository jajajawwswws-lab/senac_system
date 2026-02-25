import { IncomingMessage, ServerResponse } from "node:http";

interface CreationCredentials {
    id: number,
    usernameInput: string,
    email: string,
    phone: number,
    password: string,
    password_require: string,
    submit: string,
    recaptchaToken: string
}

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
            success: false,
            error: 'Método não permitido no sistema'
        }));
        return;
    }

    try {

        // Ler body corretamente
        const buffers: Buffer[] = [];
        for await (const chunk of request) {
            buffers.push(chunk);
        }

        const body = Buffer.concat(buffers).toString();
        const data: CreationCredentials = JSON.parse(body);

        console.log('Body recebido: ', data);

        const { recaptchaToken } = data;

        const verifyCredentials_recaptcha = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    secret: 'SUA_SECRET_KEY_AQUI',
                    response: recaptchaToken
                })
            }
        );

        const verifyDataCredentialsAPI = await verifyCredentials_recaptcha.json();

        console.log('Resposta Google: ', verifyDataCredentialsAPI);

        if (!verifyDataCredentialsAPI.success) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido',
                details: verifyDataCredentialsAPI
            }));
            return;
        }

        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Cadastro validado com sucesso"
        }));

    } catch (error) {

        console.log('Erro no cadastro: ', error);

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

export default Authentific;
