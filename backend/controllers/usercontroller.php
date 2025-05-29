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

    public function googleLogin($data) {
        if (!isset($data['id_token'])) {
            return ['success' => false, 'message' => 'No ID token provided'];
        }

        $idToken = $data['id_token'];

        // Verify Google token
        $googleUser = $this->verifyGoogleToken($idToken);
        if (!$googleUser) {
            return ['success' => false, 'message' => 'Invalid Google token'];
        }

        $user = $this->userModel->findOrCreateGoogleUser([
            'email' => $googleUser['email'],
            'first_name' => $googleUser['first_name'],
            'last_name' => $googleUser['last_name']
        ]);

        if (!$user) {
            return ['success' => false, 'message' => 'Failed to create or find user'];
        }

        $token = generate_jwt($user['ID'], $user['EMAIL']);

        return [
            'success' => true,
            'token' => $token,
            'user' => $user
        ];
    }

    private function verifyGoogleToken($idToken) {
        $url = "https://oauth2.googleapis.com/tokeninfo?id_token=".urlencode($idToken);
        $response = file_get_contents($url);
        if ($response === false) 
            return false;
        $data = json_decode($response, true);

        if (!isset($data['email'])) 
            return false;

        return [
            'email' => $data['email'],
            'first_name' => $data['given_name'] ?? '',
            'last_name' => $data['family_name'] ?? ''
        ];
    }

}
?>