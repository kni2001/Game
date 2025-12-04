<?php
require_once 'helpers.php';

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
$display_name = trim($input['display_name'] ?? $username);

if (!$username || !$password) {
    json_response(['success' => false, 'message' => 'username and password required'], 400);
}

try {
    $pdo = getPDO();
    // check duplicate username
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        json_response(['success' => false, 'message' => 'username already exists'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)');
    $stmt->execute([$username, $hash, $display_name]);
    $userId = $pdo->lastInsertId();

    // auto-login
    $_SESSION['user_id'] = (int)$userId;
    $user = get_current_user();
    json_response(['success' => true, 'message' => 'Registered', 'user' => $user]);
} catch (Exception $e) {
    json_response(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()], 500);
}
