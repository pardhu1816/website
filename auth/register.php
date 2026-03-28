<?php
// auth/register.php
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

$username = $data['username'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$full_name = !empty($data['full_name']) ? $data['full_name'] : $username;
$phone_number = $data['phone_number'] ?? '';
$role = $data['role'] ?? 'patient';
$nameToUse = !empty($full_name) ? $full_name : (!empty($username) ? $username : explode('@', $email)[0]);

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([trim($email)]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO users (username, email, password, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)');
$result = $stmt->execute([$nameToUse, trim($email), $password, $nameToUse, $phone_number, $role]);

if ($result) {
    $insertId = $pdo->lastInsertId();
    $userData = [
        'id' => $insertId,
        'username' => $nameToUse,
        'email' => $email,
        'full_name' => $nameToUse,
        'role' => $role,
        'api_token' => 'php_token_' . time()
    ];
    echo json_encode(['success' => true, 'data' => $userData]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed']);
}
?>
