<?php
require_once 'helpers.php';
$pdo = getPDO();

try {
    // best score per user
    $topStmt = $pdo->query("
        SELECT u.id, u.username, IFNULL(u.display_name, u.username) AS display_name, u.avatar_url, MAX(s.score) AS best_score
        FROM users u
        JOIN scores s ON s.user_id = u.id
        GROUP BY u.id
        ORDER BY best_score DESC
        LIMIT 5
    ");
    $top = $topStmt->fetchAll();

    $result = $top;

    // if user logged in, include their best score if not already in top 5
    if (!empty($_SESSION['user_id'])) {
        $meStmt = $pdo->prepare("
            SELECT u.id, u.username, IFNULL(u.display_name, u.username) AS display_name, u.avatar_url, IFNULL(MAX(s.score), 0) AS best_score
            FROM users u
            LEFT JOIN scores s ON s.user_id = u.id
            WHERE u.id = ?
            GROUP BY u.id
        ");
        $meStmt->execute([$_SESSION['user_id']]);
        $me = $meStmt->fetch();

        $inTop = false;
        foreach ($result as $r) {
            if ($r['id'] == $me['id']) { $inTop = true; break; }
        }
        if (!$inTop) {
            $result[] = $me;
        }
    }

    json_response(['success' => true, 'leaderboard' => $result]);
} catch (Exception $e) {
    json_response(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()], 500);
}
