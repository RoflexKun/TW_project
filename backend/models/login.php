<?php
require_once(__DIR__."/../controllers/usercontroller.php");

$controller = new UserController();

$response = $controller->login($_POST);

echo json_encode($response);
?>