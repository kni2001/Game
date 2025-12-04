<?php
require_once 'helpers.php';
require_login();
json_response(['success' => true, 'user' => get_current_user()]);
