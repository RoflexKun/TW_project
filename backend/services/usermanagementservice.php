<?php
require_once(__DIR__."/../controllers/admincontroller.php");
$controller = new AdminController();

$action = $_POST['action'];

if($action === 'delete'){
    $controller->deleteUser($_POST['id']);
}elseif($action === 'add'){
    $controller->promoteUser($_POST['id']);
}else{
    $controller->demoteUser($_POST['id']);
}
?>