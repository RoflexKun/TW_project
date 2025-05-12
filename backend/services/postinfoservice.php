<?php
require_once(__DIR__."/../controllers/postcontroller.php");
$controller = new PostController();

$response = $controller->getPostInfo($_POST);

header('Content-Type: application/json');
echo json_encode($response);
?>
