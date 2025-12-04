<?php
require_once 'helpers.php';
require_login();

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$display_name = trim($input['display_name'] ?? '');
$avatar_url = trim($input['avatar_url'] ?? '');

if ($display_name === '' && $avatar_url === '') {
    json_response(['success' => false, 'message' => 'Nothing to update'], 400);
}

try {
    $pdo = getPDO();
    $fields = [];
    $params = [];
    if ($display_name !== '') { $fields[] = 'display_name = ?'; $params[] = $display_name; }
    if ($avatar_url !== '') { $fields[] = 'avatar_url = ?'; $params[] = $avatar_url; }
    $params[] = $_SESSION['user_id'];
    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response(['success' => true, 'message' => 'Profile updated', 'user' => get_current_user()]);
} catch (Exception $e) {
    json_response(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()], 500);
}
