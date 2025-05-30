<?php
require_once(__DIR__."/../controllers/admincontroller.php");
$controller = new AdminController();

$allPosts = $controller->getAllPosts();
$allPostsJSONFormat = [];

for($i = 0; $i < count($allPosts['id']); $i++){
    $allPostsJSONFormat[] = [
        "id" => $allPosts['id'][$i],
        "name" => $allPosts['name'][$i],
        "age" => $allPosts['age'][$i],
        "thumbnail" => $allPosts['thumbnail'][$i]
    ];
}

$jsonData = json_encode($allPostsJSONFormat, JSON_PRETTY_PRINT);

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="posts.json"');
header('Content-Length: ' . strlen($jsonData));

echo $jsonData;
?>