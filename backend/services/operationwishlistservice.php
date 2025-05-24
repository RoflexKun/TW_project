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

$action = $_POST['action'];

if($action === 'duplicate'){
    $isDuplicate = $controllerPost->checkDuplicatePost($_POST['postId'], $controllerUser->getUserId($token));
    echo $isDuplicate ? 'true' : 'false';
    exit;
}

if($action === 'add'){
    echo json_encode($controllerPost->addWishlistPost($_POST['postId'], $controllerUser->getUserId($token)));
    exit; 
}else {
    echo json_encode($controllerPost->removeWishlistPost($_POST['postId'], $controllerUser->getUserId($token)));
}


?>