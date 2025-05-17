<?php
require_once(__DIR__."/../controllers/postcontroller.php");
$controller = new PostController();

$medicalTags = isset($_POST['medical_tags']) ? json_decode($_POST['medical_tags'], true) : [];
$foodLikeTags = isset($_POST['food_like_tags']) ? json_decode($_POST['food_like_tags'], true) : [];
$foodDislikeTags = isset($_POST['food_dislike_tags']) ? json_decode($_POST['food_dislike_tags'], true) : [];

$mediaFiles = $_FILES['media'] ?? [];
$thumbnailFile = $_FILES['thumbnail'] ?? null;

$response = $controller->createPost(
    $_POST,
    $thumbnailFile,
    $mediaFiles,
    $medicalTags,
    $foodLikeTags,
    $foodDislikeTags
);

echo json_encode($response);

?>