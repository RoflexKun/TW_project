<?php
require_once(__DIR__ . "/../controllers/postcontroller.php");
$controller = new PostController();

$species = $_POST['species'] ?? '';
$breed = $_POST['breed'] ?? '';
$size = $_POST['size'] ?? '';
$gender = $_POST['gender'] ?? '';
$city = $_POST['city'] ?? '';
$ageMin = $_POST['age_min'] ?? '';
$ageMax = $_POST['age_max'] ?? '';

$filterResults = [];

if ($species !== "Any") {
    $res = $controller->getPostsBySpecies($species);
    if (isset($res['id'])) {
        $filterResults['species'] = $res['id'];
    } elseif (isset($res['error'])) {
        echo json_encode(['status' => 'error', 'message' => $res['error']]);
        exit;
    }
}

if ($breed !== "Any") {
    $res = $controller->getPostsByBreed($breed);
    if (isset($res['id'])) {
        $filterResults['breed'] = $res['id'];
    } elseif (isset($res['error'])) {
        echo json_encode(['status' => 'error', 'message' => $res['error']]);
        exit;
    }
}

if ($size !== "Any") {
    $res = $controller->getPostsBySize($size);
    if (isset($res['id'])) {
        $filterResults['size'] = $res['id'];
    } elseif (isset($res['error'])) {
        echo json_encode(['status' => 'error', 'message' => $res['error']]);
        exit;
    }
}

if ($gender !== "Any") {
    $res = $controller->getPostsByGender($gender);
    if (isset($res['id'])) {
        $filterResults['gender'] = $res['id'];
    } elseif (isset($res['error'])) {
        echo json_encode(['status' => 'error', 'message' => $res['error']]);
        exit;
    }
}

if ($city !== "Any") {
    $res = $controller->getPostsByCity($city);
    if (isset($res['id'])) {
        $filterResults['city'] = $res['id'];
    } elseif (isset($res['error'])) {
        echo json_encode(['status' => 'error', 'message' => $res['error']]);
        exit;
    }
}

if ($ageMin != 0 || $ageMax != 20) {
    $res = $controller->getPostsByAge($ageMin, $ageMax);
    if (isset($res['id'])) {
        $filterResults['age'] = $res['id'];
    } elseif (isset($res['error'])) {
        echo json_encode(['status' => 'error', 'message' => $res['error']]);
        exit;
    }
}

$finalResults = [];
if (!empty($filterResults)) {
    foreach ($filterResults as $ids) {
        if (empty($ids)) {
            $finalResults = [];
            break;
        }

        if (empty($finalResults)) {
            $finalResults = $ids;
        } else {
            $finalResults = array_intersect($finalResults, $ids);
        }
    }
}

$sorted = $_POST['sorted'] ?? '';
if(!empty($finalResults)){
    $postsArray = $controller->getPostsById($finalResults);
    if($sorted === 'New'){
       $postsArray = array_reverse($postsArray);
    }  
    elseif($sorted === 'Popular'){
       $popularPostsId = $controller->getPopularPosts(); 
        $postsArray = array_values(array_filter($popularPostsId, function ($id) use ($finalResults) {
            return in_array($id, $finalResults);
        }));
        $postsArray = $controller->getPostsById($postsArray);
    }
}
else {
    $postsArray = [];
}

header('Content-Type: application/json');
echo json_encode(['data' => $postsArray]);
