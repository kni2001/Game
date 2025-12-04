<?php
require_once 'helpers.php';
require_login();

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$score = isset($input['score']) ? intval($input['score']) : null;
$level = trim($input['level'] ?? '');

if ($score === null) {
    json_response(['success' => false, 'message' => 'score is required'], 400);
}

try {
    $pdo = getPDO();
    $stmt = $pdo->prepare('INSERT INTO scores (user_id, score, level) VALUES (?, ?, ?)');
    $stmt->execute([$_SESSION['user_id'], $score, $level]);
    json_response(['success' => true, 'message' => 'Score added']);
} catch (Exception $e) {
    json_response(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()], 500);
}
