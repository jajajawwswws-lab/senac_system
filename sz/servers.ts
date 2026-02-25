// api/src/server.ts
/*
import dotenv from 'dotenv';
import path from 'path';

// Carrega o .env da pasta atual (api/)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verificação imediata
console.log('📁 Carregando .env de:', path.resolve(__dirname, '../.env'));
console.log('🔑 CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? '✅ Encontrada' : '❌ Não encontrada');

import express, { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Verifica se a chave existe
if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌ ERRO CRÍTICO: CLERK_SECRET_KEY não está definida!');
  console.log('Crie um arquivo .env na pasta api com:');
  console.log('CLERK_SECRET_KEY=sk_test_sua_chave_aqui');
  console.log('PORT=3001');
  process.exit(1);
}

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// Middleware de log simples
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de teste
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: '✅ API do Senac System',
    status: 'online',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Rota para listar usuários (teste com Clerk)
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Buscando usuários no Clerk...');
    
    const users = await clerkClient.users.getUserList({
      limit: 10
    });
    
    console.log(`✅ Encontrados ${users.length} usuários`);
    
    res.json({
      success: true,
      total: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || 'sem email',
        nome: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'sem nome',
        criado: user.createdAt
      }))
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Verifique se a CLERK_SECRET_KEY está correta no .env'
    });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📁 Pasta: ${__dirname}`);
  console.log(`🔑 Clerk: ${process.env.CLERK_SECRET_KEY ? 'Configurado' : 'Não configurado'}`);
  console.log('='.repeat(50) + '\n');
});

export default app;
*/