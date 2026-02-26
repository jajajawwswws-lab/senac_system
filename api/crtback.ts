import { VercelRequest, VercelResponse } from '@vercel/node';

interface LoginRequest {
  email: string;
  password: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {

  // 🔹 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 🔹 Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔹 Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }

  try {

    const { email, password }: LoginRequest = req.body;

    console.log("📥 Dados recebidos:", {
      email: email || '[AUSENTE]',
      password: password ? '[PRESENTE]' : '[AUSENTE]'
    });

    // 🔹 Validação campos obrigatórios
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: email e password'
      });
    }

    // 🔹 Validação email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // 🔹 Validação senha
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    if (password.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Senha muito longa (máx 50 caracteres)'
      });
    }

    // 🔹 SUCESSO (sem banco)
    console.log(`✅ Login liberado para: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        email,
        authenticated: true,
        redirect: 'index.html',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {

    console.error('❌ Erro interno:', error);

    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}
