// api/verificar.js - Versão minimalista
export default async function handler(req, res) {
    const { token } = req.body;
    
    // Verificar com Google
    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=6LcvXCEsAAAAALhdjN9brcMVR33i5aQwspMOWXv9&response=${token}`
    });
    
    const data = await verify.json();
    
    if (data.success) {
        res.json({ ok: true, msg: 'Humano verificado!' });
    } else {
        res.json({ ok: false, msg: 'Robô detectado!' });
    }
}
