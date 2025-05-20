<?php
require_once(__DIR__."/../controllers/usercontroller.php");

$controller = new UserController();

$response = $controller->updateProfile($_POST);

echo json_encode($response);
?>