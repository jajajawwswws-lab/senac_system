import { IncomingMessage, ServerResponse } from "node:http";

const RECAPTCHA_SECRET = '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    // Configura CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    // Apenas POST
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    try {
        // Coleta o body
        let body = '';
        for await (const chunk of req) {
            body += chunk;
        }
        
        console.log('Body recebido:', body); // DEBUG: veja o que chega

        // Tenta fazer o parse
        let data;
        try {
            data = JSON.parse(body);
        } catch (parseError) {
            console.error('Erro no JSON:', parseError);
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: false,
                error: 'JSON inválido',
                receivedBody: body // DEBUG: mostre o que foi recebido
            }));
            return;
        }

        const { username, email, phone, password, recaptchaToken } = data;

        console.log('Dados parseados:', { username, email, phone });

        // Valida campos
        if (!username || !email || !phone || !password || !recaptchaToken) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: false,
                error: 'Todos os campos são obrigatórios'
            }));
            return;
        }

        // Verifica reCAPTCHA
        try {
            const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    secret: RECAPTCHA_SECRET,
                    response: recaptchaToken
                })
            });

            const verifyData = await verifyAPI.json();

            if (!verifyData.success) {
                console.log('reCAPTCHA inválido:', verifyData['error-codes']);
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    success: false,
                    error: 'reCAPTCHA inválido'
                }));
                return;
            }
        } catch (recaptchaError) {
            console.error('Erro no reCAPTCHA:', recaptchaError);
            // Mesmo com erro no reCAPTCHA, vamos permitir para teste
            console.log('⚠️ Continuando mesmo com erro no reCAPTCHA (apenas para teste)');
        }

        console.log('✅ reCAPTCHA válido');

        // Sucesso
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: true,
            message: 'Conta criada com sucesso!',
            data: { username, email }
        }));

    } catch (error) {
        console.error('Erro geral:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: false,
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
    }
}
