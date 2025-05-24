<?php
require_once(__DIR__."/../controllers/postcontroller.php");
require_once(__DIR__."/../controllers/usercontroller.php");
$controllerPost = new PostController();
$controllerUser = new UserController();

$medicalTags = isset($_POST['medical_tags']) ? json_decode($_POST['medical_tags'], true) : [];
$foodLikeTags = isset($_POST['food_like_tags']) ? json_decode($_POST['food_like_tags'], true) : [];
$foodDislikeTags = isset($_POST['food_dislike_tags']) ? json_decode($_POST['food_dislike_tags'], true) : [];

$mediaFiles = $_FILES['media'] ?? [];
$thumbnailFile = $_FILES['thumbnail'] ?? null;

$headers = getallheaders();
$token = null;
if (isset($headers['Authorization'])) {
    if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
}

if (!$token) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing token']);
    exit;
}


$response = $controllerPost->createPost(
    $_POST,
    $thumbnailFile,
    $mediaFiles,
    $medicalTags,
    $foodLikeTags,
    $foodDislikeTags,
    $controllerUser->getUserId($token)
);

echo json_encode($response);

?>