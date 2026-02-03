<?php
// test_connection.php
echo "Testando conexão...<br>";

try {
    $db = new PDO('sqlite:datee.db');
    echo "✅ Conexão com banco OK<br>";
    
    // Verificar tabelas
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll();
    
    if (empty($tables)) {
        echo "❌ Nenhuma tabela encontrada<br>";
    } else {
        echo "✅ Tabelas encontradas:<br>";
        foreach ($tables as $table) {
            echo "- " . $table['name'] . "<br>";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "<br>";
    echo "Diretório atual: " . __DIR__ . "<br>";
}
?>