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
    }

    try {
        // Coletar o body da requisição
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            try {
                // Parsear o body como Registro
                const data = JSON.parse(body) as Registro;
                console.log('Body recebido:', data);

                // Usar os dados tipados
                const { nome, email, recaptchaToken } = data;
                console.log('Nome:', nome);
                console.log('Email:', email);
                console.log('Token:', recaptchaToken);

                // Resposta de sucesso
                response.end(JSON.stringify({
                    success: true,
                    message: "teste connection",
                    data: { nome, email }
                }));
                if(!nome || !email || !recaptchaToken)
                    {
                        request.statusCode = 400;
                        (JSON.stringify({
                            sucess: false,
                            error: 'Metodo nao permitido no sistema'     ,
                            details: {
                            nome: !nome,
                            email: !email,
                        
                            recaptchaToken: !recaptchaToken
                        }     
                    }));
                }    
                const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    secret: '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE',
                    response: recaptchaToken
                })
                });
                const verifyDataAPI = await verifyAPI.json();
                console.log('Resposta do Google:', verifyDataAPI);
                
                if(!verifyDataAPI)
                    {  
                        response.statusCode = 400;
                        response.end(JSON.stringify({
                        sucess: false,
                        error: 'reCAPTCHA invalido',
                        details: verifyDataAPI
                    }));
                    return;
                }

                request.statusCode = 200;
                response.end(JSON.stringify({
                    sucess: true,
                    mensage: 'Formulario enviado com sucesso!',
                    dados: { nome, email }
                }));
                

                console.log('reCAPTCHA valido!');
                    
            } catch (parseError) {
                response.statusCode = 400;
                response.end(JSON.stringify({
                    success: false,
                    error: 'JSON inválido'
                }));
            }
        });
        
        
      
    } catch (error) {
        console.error('Erro no backend: TSC module', error);
        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: 'Erro interno catch'
        }));
    }
}

async function Handler(req: Registro, res: Registro): Promise<string> {
    return `User ${req.nome} and ${res.email}`;
}

export type { ServerRequest };
export type { Handler };
