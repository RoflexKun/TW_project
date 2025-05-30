<?php
require_once(__DIR__."/../controllers/admincontroller.php");
require_once(__DIR__."/../controllers/usercontroller.php");
$controller = new AdminController();
$controllerUser = new UserController();

$headers = getallheaders();
$token = null;
if (isset($headers['Authorization'])) {
    if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
}

if (!$token) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing token']);
    exit;
}

$isAdmin = $controller->verifyAdmin($controllerUser->getUserId($token));

echo json_encode(['is_admin' => $isAdmin]);

