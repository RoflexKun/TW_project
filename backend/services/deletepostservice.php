<?php

function deleteMediaFilesByPostId($postId) {
    $uploadDir = '../../uploads/';
    $files = glob($uploadDir . $postId . '_*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

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

$controllerPost->deletePost($_POST['idPost']);
deleteMediaFilesByPostId($_POST['idPost']);
echo json_encode(["status" => "succes"]);
?>