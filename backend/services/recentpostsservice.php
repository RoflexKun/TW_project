<?php
require_once(__DIR__."/../controllers/postcontroller.php");
require_once(__DIR__."/../controllers/usercontroller.php");
$controllerPost = new PostController();

$allPostsId = $controllerPost->getAllPosts(); 
$postsArray = $controllerPost->getPostsById($allPostsId);

header('Content-Type: application/json');
echo json_encode(['data' => $postsArray]);
?>