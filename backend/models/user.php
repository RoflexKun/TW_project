<?php
require_once(__DIR__ . "/../config/database.php");

class User
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function register($data)
    {
        self::verifyTable();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        $checkUser = "
        DECLARE
            user_count NUMBER := 0;
        BEGIN
            SELECT COUNT(*) INTO user_count FROM users WHERE email = :email;
            :user_exists := user_count;
        END;";

        $checkUserCommand = oci_parse($this->conn, $checkUser);
        $user_exists = 0;
        
        oci_bind_by_name($checkUserCommand, ":email", $email);
        oci_bind_by_name($checkUserCommand, ":user_exists", $user_exists, 8);
        oci_execute($checkUserCommand);
        
        if ($user_exists > 0) {
            return false;
        }
        
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $insertUser = "
        DECLARE
            new_id NUMBER;
            CURSOR iterate_users IS SELECT * FROM users;
        BEGIN
            new_id := 1;
            FOR user_line IN iterate_users LOOP
                new_id := new_id + 1;
            END LOOP;
            
            INSERT INTO users(id, email, password_hash)
            VALUES(new_id, :email, :password_hash);
            
            :new_id := new_id;
        END;";
        
        $new_id = 0;
        $insertCommand = oci_parse($this->conn, $insertUser);
        
        oci_bind_by_name($insertCommand, ":email", $email);
        oci_bind_by_name($insertCommand, ":password_hash", $hashed_password);
        oci_bind_by_name($insertCommand, ":new_id", $new_id, 8);
        
        if (oci_execute($insertCommand)) {
            return ["id" => $new_id, "email" => $email];
        } else {
            $error = oci_error($insertCommand);
            return false;
        }
    }
    
    public function login($data)
    {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        $getUserData = "
        DECLARE
            user_id NUMBER := 0;
            pwd_hash VARCHAR2(255);
            user_found BOOLEAN := false;
            CURSOR user_lines IS SELECT * FROM users WHERE email = :email;
        BEGIN
            FOR line IN user_lines LOOP
                user_id := line.id;
                pwd_hash := line.password_hash;
                user_found := true;
                EXIT;
            END LOOP;
            
            :user_id := user_id;
            :pwd_hash := pwd_hash;
            :user_found := CASE WHEN user_found THEN 1 ELSE 0 END;
        END;";
        
        $user_id = 0;
        $pwd_hash = '';
        $user_found = 0;
        
        $getUserCommand = oci_parse($this->conn, $getUserData);
        oci_bind_by_name($getUserCommand, ":email", $email);
        oci_bind_by_name($getUserCommand, ":user_id", $user_id, 8);
        oci_bind_by_name($getUserCommand, ":pwd_hash", $pwd_hash, 255);
        oci_bind_by_name($getUserCommand, ":user_found", $user_found, 1);
        
        oci_execute($getUserCommand);
        
        if ($user_found == 1 && password_verify($password, $pwd_hash)) {
            return ["id" => $user_id, "email" => $email];
        }
        else {
            return false;
        }
    }
    
    public function getProfile($user_id)
    {
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

        $stmt = oci_parse($this->conn, $getUserData);
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
            return [
                'user' => [
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'email' => $email,
                    'date_of_birth' => $formatted_date,
                    'id'=> $user_id
                ]
            ];
        } else {
            return false;
        }
    }

    public function updateProfile($user_id,$data)
    {
        $first_name = $data['first_name'] ?? null;
        $last_name = $data['last_name'] ?? null;
        $date_of_birth = $data['date_of_birth'] ?? null;

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

        $stmt = oci_parse($this->conn, $updateProfileSQL);
        oci_bind_by_name($stmt, ":user_id", $user_id);
        oci_bind_by_name($stmt, ":first_name", $first_name);
        oci_bind_by_name($stmt, ":last_name", $last_name);
        oci_bind_by_name($stmt, ":date_of_birth", $date_of_birth);
        oci_bind_by_name($stmt, ":rows_updated", $rows_updated);

        if (oci_execute($stmt)) {
            if ($rows_updated > 0) {
                return [
                    'user' => [
                        'first_name' => $first_name,
                        'last_name' => $last_name,
                        'date_of_birth' => $date_of_birth
                    ]
                ];
            } else {
                return false;
            }
        } else {
            $e = oci_error($stmt);
            return [
                'status' => 'error',
                'message' => 'Failed to update profile: ' . $e['message']
            ];
        }
    }
    
    public function verifyTable()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('users')
        ";
        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE users (
                id NUMBER PRIMARY KEY,
                email VARCHAR2(255) UNIQUE,
                first_name VARCHAR2(255),
                last_name VARCHAR2(255),
                latitude NUMBER,
                longitude NUMBER,
                date_of_birth DATE,
                password_hash VARCHAR2(255) NOT NULL
            )";
            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
}
?>