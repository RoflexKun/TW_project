<?php
session_start();
require_once(__DIR__ . "/../config/database.php");

if (!isset($_SESSION['user_id']) || !$_SESSION['logged_in']) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$first_name = $_POST['first_name'] ?? null;
$last_name = $_POST['last_name'] ?? null;
$date_of_birth = $_POST['date_of_birth'] ?? null;

$db = Database::getDbInstance();
$conn = $db->getConnection();

$updateProfileSQL = "
BEGIN
    UPDATE users
    SET 
        first_name = :first_name,
        last_name = :last_name,
        date_of_birth = TO_DATE(:date_of_birth, 'DD-MM-YYYY')
    WHERE id = :user_id;
    
    :rows_updated := SQL%ROWCOUNT;
END;";

$rows_updated = 0;

$stmt = oci_parse($conn, $updateProfileSQL);
oci_bind_by_name($stmt, ":user_id", $user_id);
oci_bind_by_name($stmt, ":first_name", $first_name);
oci_bind_by_name($stmt, ":last_name", $last_name);
oci_bind_by_name($stmt, ":date_of_birth", $date_of_birth);
oci_bind_by_name($stmt, ":rows_updated", $rows_updated);

if (oci_execute($stmt)) {
    if ($rows_updated > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => [
                'first_name' => $first_name,
                'last_name' => $last_name,
                'date_of_birth' => $date_of_birth
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No changes made to profile'
        ]);
    }
} else {
    $e = oci_error($stmt);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update profile: ' . $e['message']
    ]);
}
?>