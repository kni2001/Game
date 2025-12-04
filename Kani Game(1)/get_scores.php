<?php
require_once 'helpers.php';
require_login();
$pdo = getPDO();
$stmt = $pdo->prepare('SELECT id, score, level, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
$stmt->execute([$_SESSION['user_id']]);
$scores = $stmt->fetchAll();
json_response(['success' => true, 'scores' => $scores]);
