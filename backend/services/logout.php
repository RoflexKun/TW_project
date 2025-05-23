<?php
require_once(__DIR__."/../controllers/usercontroller.php");

header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>