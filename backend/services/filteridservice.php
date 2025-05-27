<?php
require_once(__DIR__ . "/../controllers/postcontroller.php");
$controller = new PostController();

$ids = explode(';', $_POST['ids']);
$filter = trim($_POST['filter']);

if ($filter === 'All') {
    header('Content-Type: application/json');
    echo json_encode(['data' => $ids]);
}else {
    $newIds = $controller->getFilteredIds($ids, $filter);
    header('Content-Type: application/json');
    echo json_encode(['data' => $newIds]);
}

?>