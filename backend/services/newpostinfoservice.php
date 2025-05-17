<?php
require_once(__DIR__ . "/../controllers/postcontroller.php");

$controller = new PostController();
$action = $_POST['action'] ?? '';

if ($action === "breed" && isset($_POST['species_id'])) {
    $speciesId = (int)$_POST['species_id'];
    $response = $controller->getBreeds($speciesId);
} else if ($action === "species") {
    $response = $controller->getSpecies();
} else if($action === "location"){
    $response = $controller->getLocations();
}

header('Content-Type: application/json');
echo json_encode($response);
?>