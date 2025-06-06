<?php
require_once(__DIR__."/../controllers/postcontroller.php");
require_once(__DIR__."/../controllers/usercontroller.php");
$controllerPost = new PostController();
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

$response = $controllerPost->getUserPosts($controllerUser->getUserId($token));

echo json_encode($response);
?>