<?php
// config.php - DB + session + common headers
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'fruit_match');
define('DB_USER', 'root');
define('DB_PASS', ''); // change to your MySQL password if any

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// PDO
function getPDO() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}

// JSON headers (same origin; keep Access-Control-Allow-Origin * if testing locally)
header('Content-Type: application/json; charset=utf-8');
// header('Access-Control-Allow-Origin: *'); // uncomment only if you need cross-origin for dev
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
