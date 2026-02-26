import { VercelRequest, VercelResponse } from '@vercel/node';

interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  recaptchaToken: string;
}

// Validação simples de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {

  // 🔓 CORS LIBERADO (APENAS PARA TESTE)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }

  try {
    // 🔐 Segurança contra body undefined
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Body inválido ou ausente'
      });
    }

    const {
      username,
      email,
      phone,
      password,
      recaptchaToken
    } = req.body as RegisterRequest;

    // 🔎 Validações básicas
    if (!username || !email || !phone || !password || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }

    if (username.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Username deve ter pelo menos 5 caracteres'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 8 caracteres'
      });
    }

    // 🔐 VALIDAR reCAPTCHA v3
    const SECRET_KEY = '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE';

    if (!SECRET_KEY) {
      console.error("RECAPTCHA_SECRET_KEY não configurada");
      return res.status(500).json({
        success: false,
        error: 'Erro interno de configuração'
      });
    }

    const googleResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${SECRET_KEY}&response=${recaptchaToken}`
      }
    );

    const recaptchaData = await googleResponse.json();

    if (!recaptchaData.success) {
      return res.status(400).json({
        success: false,
        error: 'Falha na verificação do reCAPTCHA'
      });
    }

    // ✅ SUCESSO (SEM BANCO – APENAS TESTE)
    return res.status(200).json({
      success: true,
      message: 'Conta criada com sucesso (modo teste)',
      data: {
        username,
        email,
        phone,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro interno:', error);

    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}
