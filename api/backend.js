// api/verificar-recaptcha.js
export default async function handler(req, res) {
    // ✅ SEMPRE definir header JSON
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Se não for POST
        if (req.method !== 'POST') {
            return res.status(405).json({ 
                sucesso: false, 
                erro: 'Método não permitido' 
            });
        }

        const { recaptchaToken } = req.body;

        // Validar token
        if (!recaptchaToken) {
            return res.status(400).json({ 
                sucesso: false, 
                erro: 'Token não fornecido' 
            });
        }

        // Verificar com Google
        const respostaGoogle = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: '6LcvXCEsAAAAALhdjN9brcMVR33i5aQwspMOWXv9',
                response: recaptchaToken
            })
        });

        const dadosGoogle = await respostaGoogle.json();

        // ✅ Retorno SEMPRE em JSON
        if (dadosGoogle.success) {
            return res.status(200).json({
                sucesso: true,
                mensagem: 'reCAPTCHA válido!',
                score: dadosGoogle.score || null
            });
        } else {
            return res.status(400).json({
                sucesso: false,
                erro: 'reCAPTCHA inválido',
                codigos: dadosGoogle['error-codes']
            });
        }

    } catch (erro) {
        // ✅ Mesmo erro é em JSON
        console.error('Erro no servidor:', erro);
        return res.status(500).json({
            sucesso: false,
            erro: 'Erro interno',
            detalhes: erro.message
        });
    }
}
