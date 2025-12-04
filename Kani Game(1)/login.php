<?php
require_once 'helpers.php';

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    json_response(['success' => false, 'message' => 'username and password required'], 400);
}

try {
    $pdo = getPDO();
    $stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_response(['success' => false, 'message' => 'Invalid credentials'], 401);
    }
    $_SESSION['user_id'] = (int)$user['id'];
    json_response(['success' => true, 'message' => 'Logged in', 'user' => get_current_user()]);
} catch (Exception $e) {
    json_response(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()], 500);
}
