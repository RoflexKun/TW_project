<?php

require_once (__DIR__ . '/../../util/vendor/autoload.php');
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

const JWT_SECRET = 'CandPisicaNu-iScasaSoareciiJoacaPeMasa';

function generate_jwt($user_id, $email) {
    $payload = [
        'iss' => 'pets2adopt.com',
        'iat' => time(),
        'exp' => time() + (60*60), // 1 hour
        'user_id' => $user_id,
        'email' => $email
    ];
    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

function validate_jwt($token) {
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        return false;
    }
}
?>