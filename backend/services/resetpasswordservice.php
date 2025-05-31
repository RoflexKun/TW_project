<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once (__DIR__.'/../../util/vendor/autoload.php');
require_once(__DIR__."/../controllers/usercontroller.php");
$controllerUser = new UserController();

$token = $_POST['token'];
$newPass = $_POST['new_pass'];
$secretKey = 'secretkeyforemaillongenoughtomakethiskeyvalid';

try {
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    $email = $decoded->email ?? null;

    if (!$email) {
        echo json_encode(['error' => 'Invalid token payload.']);
        exit;
    }

    echo json_encode($controllerUser->updatePassword($email, $newPass));
} catch(Exception $ex){
    echo json_encode(['error' => $ex->getMessage()]);
}

?>