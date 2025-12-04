<?php
require_once 'config.php';

function json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function require_login() {
    if (empty($_SESSION['user_id'])) {
        json_response(['success' => false, 'message' => 'Authentication required'], 401);
    }
}


