<?php
require_once(__DIR__."/../controllers/postcontroller.php");
require_once(__DIR__."/../controllers/usercontroller.php");
$controllerPost = new PostController();

$popularPostsId = $controllerPost->getPopularPosts(); 
$postsArray = $controllerPost->getPostsById($popularPostsId);

header('Content-Type: application/json');
echo json_encode(['data' => $postsArray]);
?>