<?php
session_start();
require_once(__DIR__ . "/../config/database.php");

if (!isset($_SESSION['user_id']) || !$_SESSION['logged_in']) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$db = Database::getDbInstance();
$conn = $db->getConnection();

$getUserData = "
DECLARE
    user_first_name VARCHAR2(255);
    user_last_name VARCHAR2(255);
    user_email VARCHAR2(255);
    user_date_of_birth DATE;
    user_found NUMBER := 0;
BEGIN
    SELECT 
        first_name, 
        last_name, 
        email, 
        date_of_birth
    INTO 
        user_first_name, 
        user_last_name, 
        user_email, 
        user_date_of_birth
    FROM users WHERE id = :user_id;
    
    :first_name := user_first_name;
    :last_name := user_last_name;
    :email := user_email;
    :date_of_birth := user_date_of_birth;
    :found := 1;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        :found := 0;
END;";

$first_name = null;
$last_name = null;
$email = null;
$date_of_birth = null;
$found = 0;

$stmt = oci_parse($conn, $getUserData);
oci_bind_by_name($stmt, ":user_id", $user_id);
oci_bind_by_name($stmt, ":first_name", $first_name, 255);
oci_bind_by_name($stmt, ":last_name", $last_name, 255);
oci_bind_by_name($stmt, ":email", $email, 255);
oci_bind_by_name($stmt, ":date_of_birth", $date_of_birth, 255);
oci_bind_by_name($stmt, ":found", $found);

oci_execute($stmt);

// Format time
$formatted_date = null;
if ($date_of_birth) {
    $date = strtotime($date_of_birth);
    $formatted_date = date('d-m-Y', $date);
}

// Return user profile data
if ($found) {
    echo json_encode([
        'status' => 'success',
        'data' => [
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'date_of_birth' => $formatted_date
        ]
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'User profile not found'
    ]);
}
?>