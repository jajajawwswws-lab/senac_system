import http from "node:http";
import dotenv from "dotenv";

dotenv.config();

// Cria o server (MESMO código, mas SEM o listen)
const server = http.createServer((req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 🔹 Rota da API: /api/crtback
    if (req.url === "/api/crtback") {
        if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
        }

        if (req.method === "POST") {
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: true,
                message: "POST recebido"
            }));
            return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    // Qualquer outra rota → 404
    res.statusCode = 404;
    res.end("Rota não encontrada");
});

// ✅ PARA VERCEL: Exporte o server (NÃO use server.listen())
export default server;