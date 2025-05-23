<?php
require_once(__DIR__."/../controllers/usercontroller.php");

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

$controller = new UserController();
$response = $controller->getProfile($token);

header('Content-Type: application/json');
echo json_encode($response);
?>