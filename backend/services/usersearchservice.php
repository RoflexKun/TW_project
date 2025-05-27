<?php
require_once(__DIR__."/../controllers/admincontroller.php");
$controller = new AdminController();

$response = $controller->getUsersBySearch($_POST['search']);

header('Content-Type: application/json');
echo json_encode(['data' => $response]);

?>