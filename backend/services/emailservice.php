<?php
error_reporting(E_ALL & ~E_DEPRECATED); // This will supress the warning with deprecated, since the email service works I need the result from this to not contain that warning
use Firebase\JWT\JWT;

require_once (__DIR__.'/../../util/vendor/autoload.php');
require_once(__DIR__."/../controllers/usercontroller.php");
$controllerUser = new UserController();
$env = parse_ini_file(__DIR__.'/../../misc/.env');


$secretKey = 'secretkeyforemaillongenoughtomakethiskeyvalid';
$email = $_POST['email'];

$userExists = $controllerUser->verifyEmail($email);

if(!$userExists){
    echo json_encode(['status' => 'No account with this email']);
    exit;
}



$payload = [
    'email' => $email,
    'exp' => time() + 900 // 15 minute time to reset password
];
$jwtToken = JWT::encode($payload, $secretKey, 'HS256');

$resetLink = "http://localhost/frontend/pages/reset_password.html?token=$jwtToken";

$emailService = new \SendGrid\Mail\Mail();
$emailService->setFrom("pets2adoptnoreply@gmail.com", "Pets2Adopt");
$emailService->setSubject("Link to reset your password");
$emailService->addTo($email);
$emailService->addContent(
    "text/plain",
    "Hello,\n\nClick the link below to reset your password:\n$resetLink\n\nIf you didn't request a password reset, please ignore this email.\n\nThank you!"
);

stream_context_set_default([
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true,
    ],
]);
$sendGrid = new \SendGrid($env['SENDGRIP_API_KEY']);
$sendGrid->send($emailService);
echo json_encode(['status' => 'Password reset email sent.']);
?>

