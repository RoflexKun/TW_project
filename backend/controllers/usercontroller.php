<?php
require_once(__DIR__."/../models/User.php");

class UserController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function register($data) {
        return $this->userModel->register($data);
    }
    
    public function login($data) {
        return $this->userModel->login($data);
    }
    
    public function logout() {
        return $this->userModel->logout();
    }
    
    public function getProfile() {
        return $this->userModel->getProfile();
    }
    
    public function updateProfile($data) {
        return $this->userModel->updateProfile($data);
    }
}
?>