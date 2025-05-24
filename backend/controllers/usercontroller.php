<?php
require_once(__DIR__."/../models/User.php");
require_once(__DIR__."/../utils/jwt_helper.php");

class UserController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function register($data) {
        $user = $this->userModel->register($data);
        if ($user) {
            $token = generate_jwt($user['id'], $user['email']);
            return ['user' => $user, 'token' => $token];
        }
        return false;
    }
    
    public function login($data) {
        $user = $this->userModel->login($data);
        if ($user) {
            $token = generate_jwt($user['id'], $user['email']);
            return ['user' => $user, 'token' => $token];
        }
        return false;
    }
    
    public function logout() {
        return true;
    }
    
    public function getProfile($token) {
        $payload = validate_jwt($token);
        if ($payload) {
            return $this->userModel->getProfile($payload->user_id);
        }
        return false;
    }
    
    public function updateProfile($token, $data) {
        $payload = validate_jwt($token);
        if ($payload) {
            return $this->userModel->updateProfile($payload->user_id, $data);
        }
        return false;
    }

    public function getUserId($token) {
        $payload = validate_jwt($token);
        if($payload){
            return $payload->user_id;
        }
        return false;
    }
}
?>