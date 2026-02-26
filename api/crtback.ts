import { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ success: false }));
        return;
    }

    try {
        // Lê o body
        let body = '';
        for await (const chunk of req) {
            body += chunk;
        }
        
        const data = JSON.parse(body);
        console.log('✅ Dados recebidos:', data);
        
        // Sempre retorna sucesso para teste
        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            message: 'Conta criada!',
            data: { 
                username: data.username,
                email: data.email 
            }
        }));

    } catch (error) {
        console.error('❌ Erro:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ 
            success: false, 
            error: 'Erro interno' 
        }));
    }
}
