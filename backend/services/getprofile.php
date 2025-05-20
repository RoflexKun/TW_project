<?php
require_once(__DIR__."/../controllers/usercontroller.php");

$controller = new UserController();

$response = $controller->getProfile();

echo json_encode($response);
?>