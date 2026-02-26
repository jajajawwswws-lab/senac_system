import { IncomingMessage, ServerResponse } from "node:http";
import { URLSearchParams } from "node:url";

interface CreationCredentials {
    id: number;
    usernameInput: string;
    email: string;
    phone: string; // melhor como string
    password: string;
    password_require: string;
    submit: string;
    recaptchaToken: string;
}

async function Authentific(request: IncomingMessage, response: ServerResponse): Promise<void> {
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS preflight
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
            error: 'Método não permitido no sistema'
        }));
        return;
    }

    try {
        // Ler corpo da requisição
        const body: Buffer[] = [];
        for await (const chunk of request) {
            body.push(chunk);
        }
        const rawData = Buffer.concat(body).toString();
        const data: CreationCredentials = JSON.parse(rawData);
        console.log('Body recebido: ', data);

        // Verificar reCAPTCHA
        const params = new URLSearchParams();
        params.append('secret', '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE'); // seu secret key
        params.append('response', data.recaptchaToken);

        const verifyCredentials_recaptcha = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        const verifyDataCredentialsAPI = await verifyCredentials_recaptcha.json();
        console.log('Resposta Google reCAPTCHA: ', verifyDataCredentialsAPI);

        if (!verifyDataCredentialsAPI.success) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido',
                details: verifyDataCredentialsAPI
            }));
            return;
        }

        // Aqui você poderia continuar com a criação do usuário...
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: 'Usuário validado com sucesso!'
        }));

    } catch (error) {
        console.error('Erro no cadastro: ', error);
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
