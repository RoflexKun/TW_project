<?php
$env = parse_ini_file(__DIR__.'/../misc/.env');

$db_username = $env['DB_USERNAME'];
$db_password = $env['DB_PASSWORD'];
$db_connection = $env['DB_CONNECTION'];

$conn = oci_connect($db_username, $db_password, $db_connection);

if(!$conn)
{
    $e = oci_error();
    die("Connection failed: " . $e['message']);
}
?>