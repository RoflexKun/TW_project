<?php
require_once(__DIR__ . "/../controllers/postcontroller.php");
$controller = new PostController();

header("Content-Type: application/rss+xml; charset=UTF-8");

$species = $_GET['species'] ?? '';
$breed = $_GET['breed'] ?? '';
$size = $_GET['size'] ?? '';
$gender = $_GET['gender'] ?? '';
$city = $_GET['city'] ?? '';
$ageMin = $_GET['age_min'] ?? '';
$ageMax = $_GET['age_max'] ?? '';

$filterResults = [];

if ($species !== "Any") {
    $res = $controller->getPostsBySpecies($species);
    if (isset($res['id'])) $filterResults['species'] = $res['id'];
}

if ($breed !== "Any") {
    $res = $controller->getPostsByBreed($breed);
    if (isset($res['id'])) $filterResults['breed'] = $res['id'];
}

if ($size !== "Any") {
    $res = $controller->getPostsBySize($size);
    if (isset($res['id'])) $filterResults['size'] = $res['id'];
}

if ($gender !== "Any") {
    $res = $controller->getPostsByGender($gender);
    if (isset($res['id'])) $filterResults['gender'] = $res['id'];
}

if ($city !== "Any") {
    $res = $controller->getPostsByCity($city);
    if (isset($res['id'])) $filterResults['city'] = $res['id'];
}

if ($ageMin != 0 || $ageMax != 20) {
    $res = $controller->getPostsByAge($ageMin, $ageMax);
    if (isset($res['id'])) $filterResults['age'] = $res['id'];
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
if (!empty($finalResults)) {
    $postsArray = $controller->getPostsById($finalResults);
    if ($sorted === 'New') {
        $postsArray = array_reverse($postsArray);
    } elseif ($sorted === 'Popular') {
        $popularPostsId = $controller->getPopularPosts();
        $postsArray = array_values(array_filter($popularPostsId, function ($id) use ($finalResults) {
            return in_array($id, $finalResults);
        }));
        $postsArray = $controller->getPostsById($postsArray);
    }
} else {
    $postsArray = [];
}

$document = new DOMDocument("1.0", "UTF-8");
$document->formatOutput = true;

$rssPetsFeed = $document->createElement("rss");
$rssPetsFeed->setAttribute("version", "2.0");
$document->appendChild($rssPetsFeed);

$petsChannel = $document->createElement("channel");
$rssPetsFeed->appendChild($petsChannel);

$petsChannel->appendChild($document->createElement("title", "Pets2Adopt RSS Feed"));
$petsChannel->appendChild($document->createElement("link", "http://localhost/frontend/pages/HomePage.html"));
$petsChannel->appendChild($document->createElement("description", "Adoptable pets matching your filters"));
$petsChannel->appendChild($document->createElement("language", "en-us"));
$petsChannel->appendChild($document->createElement("pubDate", date(DATE_RSS)));

if (!empty($postsArray['id'])) {
    $count = count($postsArray['id']);
    for ($i = 0; $i < $count; $i++) {
        $id = htmlspecialchars($postsArray['id'][$i]);
        $name = htmlspecialchars($postsArray['name'][$i]);
        $age = htmlspecialchars($postsArray['age'][$i]);

        $item = $document->createElement("item");

        $title = $document->createElement("title");
        $title->appendChild($document->createTextNode("$name, $age years"));

        $linkUrl = "http://localhost/frontend/pages/post.html?id=$id";

        $link = $document->createElement("link");
        $link->appendChild($document->createTextNode($linkUrl));

        $guid = $document->createElement("guid");
        $guid->appendChild($document->createTextNode($linkUrl));

        $item->appendChild($title);
        $item->appendChild($link);
        $item->appendChild($guid);

        $petsChannel->appendChild($item);
    }
}

header("Content-Type: application/rss+xml; charset=UTF-8");
echo $document->saveXML();
