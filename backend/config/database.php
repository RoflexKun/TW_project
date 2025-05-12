<?php

class Database {
    private static $dbInstance = null;
    private $conn;

    private function __construct(){
        $env = parse_ini_file(__DIR__.'/../../misc/.env');
        $db_username = $env['DB_USERNAME'];
        $db_password = $env['DB_PASSWORD'];
        $db_connection = $env['DB_CONNECTION'];
        $this->conn = oci_connect($db_username, $db_password, $db_connection);

        if(!$this->conn)
            {
                $e = oci_error();
                die("Connection failed: " . $e['message']);
            }
    }

    public static function getDbInstance(){
        if(!self::$dbInstance){
            self::$dbInstance = new Database();
        }
        return self::$dbInstance;
    }

    public function getConnection(){
        return $this->conn;
    }
}





?>