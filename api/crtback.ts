// backend simplificado para teste
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ success: false, error: 'Método não permitido' }));
        return;
    }

    try {
        let body = '';
        for await (const chunk of req) {
            body += chunk;
        }
        
        const data = JSON.parse(body);
        const { username, email, phone, password, recaptchaToken } = data;

        // Valida campos obrigatórios
        if (!username || !email || !phone || !password) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                success: false,
                error: 'Todos os campos são obrigatórios'
            }));
            return;
        }

        // Para teste, ignora reCAPTCHA
        console.log('Dados recebidos:', { username, email, phone });
        
        // Sucesso
        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            message: 'Conta criada com sucesso!',
            data: { username, email }
        }));

    } catch (error) {
        console.error('Erro:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({
            success: false,
            error: 'Erro interno do servidor'
        }));
    }
}
