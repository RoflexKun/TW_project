<?php
require_once(__DIR__ . "/../models/post.php");
require_once(__DIR__ . "/../models/media.php");
require_once(__DIR__ . "/../models/medical.php");
require_once(__DIR__ . "/../models/food.php");
require_once(__DIR__ . "/../models/breed.php");
require_once(__DIR__ . "/../models/species.php");
require_once(__DIR__ . "/../models/location.php");

class PostController
{
    public function createPost($data, $thumbnail, $media, $medicalTags, $foodLikeTags, $foodDislikeTags)
    {
        $postModel = new Post();
        $mediaModel = new Media();
        $medicalModel = new Medical();
        $foodModel = new Food();

        $newId = $postModel->insertPost($data);
        if (!$newId)
            return ["status" => "error", "message" => "Failed to create a new post"];

        $mediaModel->saveMediaFiles($newId, $thumbnail, $media);
        $medicalModel->saveMedicalHistory($newId, $medicalTags);
        $foodModel->saveFoodLike($newId, $foodLikeTags);
        $foodModel->saveFoodDislike($newId, $foodDislikeTags);
        return ["status" => "succes"];
    }

    public function getSearchResults($searchInput)
    {
        $postModel = new Post();
        return $postModel->getSearchResults($searchInput);
    }

    public function getPostInfo($data)
    {
        $id = $data['id'] ?? '';
        $postModel = new Post();
        return $postModel->postInfo($id);
    }

    public function getPostsFromPage($data)
    {
        $page = $data['page'] ?? '';
        $limit = $data['limit'] ?? '';
        $postModel = new Post();
        return $postModel->getPostsFromPage($page, $limit);
    }

    public function getPostCount()
    {
        $postModel = new Post();
        return $postModel->getPostCount();
    }

    public function getBreeds($speciesId)
    {
        $breedModel = new Breed();
        return $breedModel->getBreedBySpecies($speciesId);
    }

    public function getSpecies()
    {
        $speciesModel = new Species();
        return $speciesModel->getSpecies();
    }

    public function getLocations()
    {
        $locationsModel = new Location();
        return $locationsModel->getLocations();
    }

    public function getPostsBySpecies($species)
    {
        $postModel = new Post();
        $result = $postModel->getPostsBySpecies($species);

        if (isset($result['id'])) {
            $result['id'] = $result['id'] === '' ? [] : explode(';', $result['id']);
        }

        return $result;
    }

    public function getPostsByBreed($breed)
    {
        $postModel = new Post();
        $result = $postModel->getPostsByBreed($breed);

        if (isset($result['id'])) {
            $result['id'] = $result['id'] === '' ? [] : explode(';', $result['id']);
        }

        return $result;
    }

    public function getPostsBySize($size)
    {
        $postModel = new Post();
        $result = $postModel->getPostsBySize($size);

        if (isset($result['id'])) {
            $result['id'] = $result['id'] === '' ? [] : explode(';', $result['id']);
        }

        return $result;
    }

    public function getPostsByGender($gender)
    {
        $postModel = new Post();
        $result = $postModel->getPostsByGender($gender);

        if (isset($result['id'])) {
            $result['id'] = $result['id'] === '' ? [] : explode(';', $result['id']);
        }

        return $result;
    }

    public function getPostsByCity($city)
    {
        $postModel = new Post();
        $result = $postModel->getPostsByCity($city);

        if (isset($result['id'])) {
            $result['id'] = $result['id'] === '' ? [] : explode(';', $result['id']);
        }

        return $result;
    }

    public function getPostsByAge($ageMin, $ageMax)
    {
        $postModel = new Post();
        $result = $postModel->getPostsByAge($ageMin, $ageMax);

        if (isset($result['id'])) {
            $result['id'] = $result['id'] === '' ? [] : explode(';', $result['id']);
        }

        return $result;
    }

    public function getPostsById($idArray){
        $postModel = new Post();
        $result = $postModel->getPostsById($idArray);

        return $result;
    }
}
