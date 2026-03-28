<?php
// auth/login.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing email or password']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? AND password = ?');
$stmt->execute([trim($data['email']), $data['password']]);
$user = $stmt->fetch();

if ($user) {
    // Return data mapped exactly like the original Node.js logic
    $userData = [
        'id' => $user['id'],
        'username' => $user['username'],
        'full_name' => !empty($user['full_name']) ? $user['full_name'] : $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'api_token' => 'php_token_' . time() // Simulate JWT since PHP does not generate the real node JWT without a library
    ];
    echo json_encode(['success' => true, 'data' => $userData]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
}
?>
