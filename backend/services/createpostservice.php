<?php
require_once(__DIR__."/../controllers/postcontroller.php");
$controller = new PostController();

$response = $controller->createPost($_POST, $_FILES['media'] ?? []);
echo json_encode($response);

?>