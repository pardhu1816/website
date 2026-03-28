<?php
// auth/reset_password.php
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

if (!isset($data['email']) || !isset($data['new_password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing email or new password']);
    exit;
}

$stmt = $pdo->prepare('UPDATE users SET password = ? WHERE email = ?');
$result = $stmt->execute([$data['new_password'], trim($data['email'])]);

if ($result && $stmt->rowCount() > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Email not found or password not changed']);
}
?>
