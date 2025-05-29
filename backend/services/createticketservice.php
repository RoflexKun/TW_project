<?php
require_once(__DIR__."/../controllers/admincontroller.php");
$controller = new AdminController();

$postId = $_POST['id'] ?? null;
$subject = $_POST['subject'] ?? '';
$description = $_POST['description'] ?? '';

$controller->createTicket($postId, $subject, $description);

?>
