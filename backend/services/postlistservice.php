<?php
require_once(__DIR__."/../controllers/postcontroller.php");
$controller = new PostController();

$action = $_POST['action'] ?? 'posts';

if ($action === 'count') {
    $response = $controller->getPostCount();
} else {
    $response = $controller->getPostsFromPage($_POST);
}

header('Content-Type: application/json');
echo json_encode($response);
?>