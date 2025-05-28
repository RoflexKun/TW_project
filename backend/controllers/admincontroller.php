<?php
require_once(__DIR__ . "/../models/post.php");
require_once(__DIR__ . "/../models/media.php");
require_once(__DIR__ . "/../models/medical.php");
require_once(__DIR__ . "/../models/food.php");
require_once(__DIR__ . "/../models/breed.php");
require_once(__DIR__ . "/../models/species.php");
require_once(__DIR__ . "/../models/location.php");
require_once(__DIR__ . "/../models/wishlist.php");
require_once(__DIR__."/../models/User.php");
require_once(__DIR__."/../utils/jwt_helper.php");

class AdminController
{
    public function getUsersBySearch($searchInput){
        $userModel = new User();
        return $userModel->getUsersBySearch($searchInput);
    }

    public function deleteUser($id){
        $postModel = new Post();
        $userModel = new User();
        $postModel->deleteUserPosts($id);
        $userModel->deleteUser($id);
    }

    public function promoteUser($id) {
        $userModel = new User();
        $userModel->promoteUser($id);
    }

    public function demoteUser($id){
        $userModel = new User();
        $userModel->demoteUser($id);
    }

    public function getPostsBySearch($searchInput){
        $postModel = new Post();
        return $postModel->getPostsBySearch($searchInput);
    }
}