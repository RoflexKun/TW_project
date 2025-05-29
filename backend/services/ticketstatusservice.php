<?php
require_once(__DIR__."/../controllers/admincontroller.php");
$controller = new AdminController();

$ticketId = $_POST['id'] ?? '';
$status = $_POST['status'] ?? '';

$controller->updateTicketStatus($ticketId, $status);

?>