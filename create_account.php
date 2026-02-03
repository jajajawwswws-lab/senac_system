<?php
// create_account.php
header('Content-Type: application/json');

// Resposta padrão
$resposta = [
    'sucesso' => false,
    'mensagem' => 'Requisição inválida.',
    'dados' => null
];

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1. Receber e validar dados do formulário
    $username = trim($_POST['username'] ?? '');
    $email    = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $phone    = preg_replace('/\D/', '', $_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';

    // 2. Validações
    $erros = [];

    if (strlen($username) < 3) {
        $erros[] = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

    if (!$email) {
        $erros[] = 'Email inválido';
    }

    if (strlen($password) < 8) {
        $erros[] = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!empty($erros)) {
        $resposta['mensagem'] = implode(', ', $erros);
        echo json_encode($resposta);
        exit;
    }

    // 3. reCAPTCHA
    $recaptchaToken = $_POST['recaptchaToken'] ?? $_POST['g-recaptcha-response'] ?? '';

    if (!$recaptchaToken) {
        $resposta['mensagem'] = 'Token reCAPTCHA não fornecido';
        echo json_encode($resposta);
        exit;
    }

    $secretKey = '6LcvXCEsAAAAALhdjN9brcMVR33i5aQwspMOWXv9';

    $dados = [
        'secret'   => $secretKey,
        'response' => $recaptchaToken,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];

    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-type: application/x-www-form-urlencoded',
            'content' => http_build_query($dados)
        ]
    ]);

    $respostaGoogle = file_get_contents(
        'https://www.google.com/recaptcha/api/siteverify',
        false,
        $context
    );

    $resultadoGoogle = json_decode($respostaGoogle, true);

    if (empty($resultadoGoogle['success'])) {
        $resposta['mensagem'] = 'Falha na verificação reCAPTCHA';
        echo json_encode($resposta);
        exit;
    }

    if (isset($resultadoGoogle['score']) && $resultadoGoogle['score'] < 0.5) {
        $resposta['mensagem'] = 'Atividade suspeita detectada';
        echo json_encode($resposta);
        exit;
    }

    // 4. Conexão com o banco
    try {
        $db = new PDO(
            'mysql:host=localhost;dbname=sistema_estoque_senac;charset=utf8mb4',
            'root',
            '',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
    } catch (PDOException $e) {
        $resposta['mensagem'] = 'Erro ao conectar ao banco';
        echo json_encode($resposta);
        exit;
    }

    // 5. Criar tabela (se não existir)
    $db->exec("
        CREATE TABLE IF NOT EXISTS users_senac (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50),
            email VARCHAR(100),
            phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            status ENUM('active','inactive','suspended') DEFAULT 'active',
            remember_token VARCHAR(100)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 6. Hash da senha
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 7. Inserir usuário (SEM validação de duplicidade)
    try {
        $stmt = $db->prepare(
            "INSERT INTO users_senac (username, email, phone, password)
             VALUES (?, ?, ?, ?)"
        );

        $stmt->execute([$username, $email, $phone, $password_hash]);

        $user_id = $db->lastInsertId();

        // Token de sessão
        $token = bin2hex(random_bytes(32));

        $db->prepare(
            "UPDATE users_senac SET remember_token = ?, last_login = NOW() WHERE id = ?"
        )->execute([$token, $user_id]);

        setcookie('user_id', $user_id, time()+604800, '/', '', false, true);
        setcookie('user_token', $token, time()+604800, '/', '', false, true);

        $resposta = [
            'sucesso' => true,
            'mensagem' => 'Conta criada com sucesso!',
            'redirect' => 'dashboard.html'
        ];

    } catch (PDOException $e) {
        $resposta['mensagem'] = 'Erro ao criar conta';
    }
}

echo json_encode($resposta);
exit;
