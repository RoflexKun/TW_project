<?php
require_once(__DIR__."/../controllers/usercontroller.php");

$controller = new UserController();
$response = $controller->googleLogin($_POST);

header('Content-Type: application/json');
echo json_encode($response);
?>