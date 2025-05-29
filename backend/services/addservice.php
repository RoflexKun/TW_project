<?php
require_once(__DIR__."/../controllers/admincontroller.php");
$controller = new AdminController();

$breed = $_POST['breed'] ?? '';
$species = $_POST['species'] ?? '';

if($species){
    $controller->addSpecies($species);
} else {
    $speciesId = $_POST['species_id'] ?? '';
    $controller->addBreed($breed, $speciesId);
}