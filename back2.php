<?php
header('Content-Type: application/json');
session_start();

// 1. Verificar se o token existe
if (!isset($_POST['g-recaptcha-response'])) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Token reCAPTCHA não recebido'
    ]);
    exit;
}

// 2. Validar reCAPTCHA
$recaptcha_secret = "6LcvXCEsAAAAALhdjN9brcMVR33i5aQwspMOWXv9";
$recaptcha_response = $_POST['g-recaptcha-response'];

$recaptcha = @file_get_contents(
    "https://www.google.com/recaptcha/api/siteverify?secret=$recaptcha_secret&response=$recaptcha_response"
);

if ($recaptcha === false) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Falha ao conectar ao Google'
    ]);
    exit;
}

$recaptcha_data = json_decode($recaptcha, true);

if (!$recaptcha_data['success'] || $recaptcha_data['score'] < 0.5) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Falha na verificação do reCAPTCHA',
        'score' => $recaptcha_data['score'] ?? 0
    ]);
    exit;
}

// 3. Verificar credenciais
$email = $_POST['email'] ?? '';
$senha = $_POST['password'] ?? '';

// 🔥 EXEMPLO — substitua pelo banco
$login_valido = ($email === "teste@email.com" && $senha === "123456");

if ($login_valido) {
    $_SESSION['usuario'] = $email;

    echo json_encode([
        'sucesso' => true,
        'login_valido' => true,
        'score' => $recaptcha_data['score']
    ]);
} else {
    echo json_encode([
        'sucesso' => true,
        'login_valido' => false,
        'erro' => 'Credenciais inválidas',
        'score' => $recaptcha_data['score']
    ]);
}
exit;
