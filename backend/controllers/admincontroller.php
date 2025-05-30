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
require_once(__DIR__."/../models/ticket.php");
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

    public function createTicket($postId, $subject, $description){
        $ticketModel = new Ticket();
        $ticketModel->createTicket($postId, $subject, $description);
    }

    public function getTickets($status){
        $ticketModel = new Ticket();
        return $ticketModel->getTickets($status);
    }

    public function updateTicketStatus($ticketId, $status){
        $ticketModel = new Ticket();
        return $ticketModel->updateTicketStatus($ticketId, $status);
    }

    public function addSpecies($species){
        $speciesModel = new Species();
        $speciesModel->addSpecies($species);
    }

    public function addBreed($breed, $speciesId) {
        $breedModel = new Breed();
        $breedModel->addBreed($breed, $speciesId);
    }

    public function getAllPosts(){
        $postModel = new Post();
        $allPosts = explode(';', $postModel->getAllPosts());
        return $postModel->getPostsById($allPosts);
    }

    public function verifyAdmin($userId){
        $userModel = new User();
        return $userModel->verifyAdmin($userId);
    }
}