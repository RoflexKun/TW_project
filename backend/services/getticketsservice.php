<?php
require_once(__DIR__."/../controllers/admincontroller.php");
$controller = new AdminController();

$status = $_POST['status'] ?? '';
if($status === 'all'){
    $status = null;
}
$result = $controller->getTickets($status);

header('Content-Type: application/json');
echo json_encode(['data' => $result]);
?>