<?php
require_once(__DIR__."/../controllers/postcontroller.php");

$controller = new PostController();

$searchInput = $_POST['searchText'];
$response = $controller->getSearchResults($searchInput);

header('Content-Type: application/json');
echo json_encode($response);
?>