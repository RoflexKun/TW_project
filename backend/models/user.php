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
        BEGIN
            SELECT NVL(MAX(id), 0) + 1 INTO new_id FROM users;
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
        } else {
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
            user_location VARCHAR2(255);
            user_date_of_birth DATE;
            user_phone_number VARCHAR2(255);
            user_found NUMBER := 0;
        BEGIN
            SELECT 
                first_name, 
                last_name, 
                email, 
                location,
                date_of_birth,
                phone_number
            INTO 
                user_first_name, 
                user_last_name, 
                user_email, 
                user_location,
                user_date_of_birth,
                user_phone_number
            FROM users WHERE id = :user_id;
            
            :first_name := user_first_name;
            :last_name := user_last_name;
            :email := user_email;
            :location := user_location;
            :date_of_birth := user_date_of_birth;
            :phone_number := user_phone_number;
            :found := 1;
            
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                :found := 0;
        END;";

        $first_name = null;
        $last_name = null;
        $email = null;
        $location = null;
        $date_of_birth = null;
        $phone_number = null;
        $found = 0;

        $stmt = oci_parse($this->conn, $getUserData);
        oci_bind_by_name($stmt, ":user_id", $user_id);
        oci_bind_by_name($stmt, ":first_name", $first_name, 255);
        oci_bind_by_name($stmt, ":last_name", $last_name, 255);
        oci_bind_by_name($stmt, ":email", $email, 255);
        oci_bind_by_name($stmt, ":location", $location, 255);
        oci_bind_by_name($stmt, ":date_of_birth", $date_of_birth, 255);
        oci_bind_by_name($stmt, ":phone_number", $phone_number, 255);
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
                    'location' => $location,
                    'date_of_birth' => $formatted_date,
                    'phone_number' => $phone_number,
                    'id' => $user_id
                ]
            ];
        } else {
            return false;
        }
    }

    public function updateProfile($user_id, $data)
    {
        $first_name = $data['first_name'] ?? null;
        $last_name = $data['last_name'] ?? null;
        $location = $data['location'] ?? null;
        $date_of_birth = $data['date_of_birth'] ?? null;
        $phone_number = $data['phone_number'] ?? null;

        $updateProfileSQL = "
        BEGIN
            UPDATE users
            SET 
                first_name = :first_name,
                last_name = :last_name,
                location = :location,
                date_of_birth = TO_DATE(:date_of_birth, 'DD-MM-YYYY'),
                phone_number = :phone_number
            WHERE id = :user_id;
            
            :rows_updated := SQL%ROWCOUNT;
        END;";

        $rows_updated = 0;

        $stmt = oci_parse($this->conn, $updateProfileSQL);
        oci_bind_by_name($stmt, ":user_id", $user_id);
        oci_bind_by_name($stmt, ":first_name", $first_name);
        oci_bind_by_name($stmt, ":last_name", $last_name);
        oci_bind_by_name($stmt, ":location", $location);
        oci_bind_by_name($stmt, ":date_of_birth", $date_of_birth);
        oci_bind_by_name($stmt, ":phone_number", $phone_number);
        oci_bind_by_name($stmt, ":rows_updated", $rows_updated);

        if (oci_execute($stmt)) {
            if ($rows_updated > 0) {
                return [
                    'user' => [
                        'first_name' => $first_name,
                        'last_name' => $last_name,
                        'location' => $location,
                        'date_of_birth' => $date_of_birth,
                        'phone_number' => $phone_number
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

    public function getUsersBySearch($searchInput)
    {
        self::verifyTable();
        self::verifyTableAdmin();
        $findQuery = "
            DECLARE
                search_input VARCHAR2(255) := :search_input;
                name_result VARCHAR2(4000) := '';
                id_result VARCHAR2(4000) := '';
                email_result VARCHAR2(4000) := '';
                is_admin_result VARCHAR2(4000) := '';
                is_admin NUMBER;
                CURSOR user_cursor IS SELECT * FROM users;
            BEGIN
                FOR user_line IN user_cursor LOOP
                    IF LOWER(user_line.first_name) IS NOT NULL AND LOWER(user_line.first_name) LIKE '%' || LOWER(search_input) || '%' THEN
                        name_result := name_result || user_line.first_name || ';';
                        id_result := id_result || user_line.id || ';';
                        email_result := email_result || user_line.email || ';';
                        SELECT COUNT(*) INTO is_admin FROM admins WHERE user_id = user_line.id;
                        IF is_admin > 0 THEN
                            is_admin_result := is_admin_result || '1;';
                        ELSE
                            is_admin_result := is_admin_result || '0;';
                        END IF;
                    ELSIF LOWER(user_line.email) LIKE '%' || LOWER(search_input) || '%' THEN
                        name_result := name_result || user_line.first_name || ';';
                        id_result := id_result || user_line.id || ';';
                        email_result := email_result || user_line.email || ';';
                        SELECT COUNT(*) INTO is_admin FROM admins WHERE user_id = user_line.id;
                        IF is_admin > 0 THEN
                            is_admin_result := is_admin_result || '1;';
                        ELSE
                            is_admin_result := is_admin_result || '0;';
                        END IF;
                    END IF;
                END LOOP;
                :name_result := name_result;
                :id_result := id_result;
                :email_result := email_result;
                :is_admin_result := is_admin_result;
            END;
        ";
        $findQueryCommand = oci_parse($this->conn, $findQuery);
        $nameArray = '';
        $idArray = '';
        $emailArray = '';
        $isAdminArray = '';
        oci_bind_by_name($findQueryCommand, ":search_input", $searchInput);
        oci_bind_by_name($findQueryCommand, ":name_result", $nameArray, 4000);
        oci_bind_by_name($findQueryCommand, ":id_result", $idArray, 4000);
        oci_bind_by_name($findQueryCommand, ":email_result", $emailArray, 4000);
        oci_bind_by_name($findQueryCommand, ":is_admin_result", $isAdminArray, 4000);

        if (oci_execute($findQueryCommand)) {
            return [
                "name" => rtrim($nameArray ?? '', ';'),
                "id" => rtrim($idArray ?? '', ';'),
                "email" => rtrim($emailArray ?? '', ';'),
                "is_admin" => rtrim($isAdminArray ?? '', ';')
            ];
        }
    }

    public function deleteUser($userId)
    {
        self::verifyTable();
        self::verifyTableAdmin();
        $deleteQuery = "
        BEGIN
            DELETE FROM admins WHERE user_id = :user_id;
            DELETE FROM users WHERE id = :user_id;
        END;
        ";
        $deleteQueryCommand = oci_parse($this->conn, $deleteQuery);
        oci_bind_by_name($deleteQueryCommand, ":user_id", $userId);
        oci_execute($deleteQueryCommand);
    }

    public function promoteUser($userId)
    {
        self::verifyTable();
        self::verifyTableAdmin();
        $promoteQuery = "
            DECLARE
                new_id NUMBER;
            BEGIN
                SELECT NVL(MAX(id), 0) + 1 INTO new_id FROM admins;
                INSERT INTO admins (id, user_id) VALUES (new_id, :user_id);
            END;
            ";
        $promoteQueryCommand = oci_parse($this->conn, $promoteQuery);
        oci_bind_by_name($promoteQueryCommand, ":user_id", $userId);
        oci_execute($promoteQueryCommand);
    }

    public function demoteUser($userId){
        self::verifyTable();
        self::verifyTableAdmin();
        $demoteQuery = "
            BEGIN
                DELETE FROM admins WHERE user_id = :user_id;
            END;
            ";
        $demoteQueryCommand = oci_parse($this->conn, $demoteQuery);
        oci_bind_by_name($demoteQueryCommand, ":user_id", $userId);
        oci_execute($demoteQueryCommand);
    }

    public function verifyTableAdmin()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('admins')
        ";
        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE admins (
                id NUMBER PRIMARY KEY,
                user_id NUMBER,
                CONSTRAINT fk_user_id_admin FOREIGN KEY (user_id) REFERENCES users(id)
            )";
            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
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
                location VARCHAR2(255),
                date_of_birth DATE,
                phone_number VARCHAR2(255),
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

    // Google login
    public function findOrCreateGoogleUser($googleUser) {
        $email = $googleUser['email'];
        $firstName = $googleUser['first_name'];
        $lastName = $googleUser['last_name'];

        // Check if user exists
        $user = $this->getUserByEmail($email);
        if ($user) {
            return $user;
        }

        $dummyPassword = password_hash('GOOGLE_USER', PASSWORD_DEFAULT);

        $insertUser = "
        DECLARE
            new_id NUMBER;
        BEGIN
            SELECT NVL(MAX(id), 0) + 1 INTO new_id FROM users;
            INSERT INTO users(id, email, first_name, last_name, password_hash)
            VALUES(new_id, :email, :first_name, :last_name, :password_hash);
            :new_id := new_id;
        END;";

        $new_id = 0;
        $insertCommand = oci_parse($this->conn, $insertUser);

        oci_bind_by_name($insertCommand, ":email", $email, 255);
        oci_bind_by_name($insertCommand, ":first_name", $firstName, 255);
        oci_bind_by_name($insertCommand, ":last_name", $lastName, 255);
        oci_bind_by_name($insertCommand, ":password_hash", $dummyPassword, 255);
        oci_bind_by_name($insertCommand, ":new_id", $new_id, 8);

        if (oci_execute($insertCommand)) {
            return $this->getUserById($new_id);
        } else {
            $e = oci_error($insertCommand);
            error_log("Oracle error: " . $e['message']);
            return false;
        }
    }

    public function getUserByEmail($email) {
        $query = "SELECT * FROM users WHERE email = :email";
        $stmt = oci_parse($this->conn, $query);
        oci_bind_by_name($stmt, ":email", $email);
        oci_execute($stmt);
        $row = oci_fetch_assoc($stmt);
        return $row ? $row : false;
    }

    public function getUserById($id) {
        $query = "SELECT * FROM users WHERE id = :id";
        $stmt = oci_parse($this->conn, $query);
        oci_bind_by_name($stmt, ":id", $id);
        oci_execute($stmt);
        $row = oci_fetch_assoc($stmt);
        return $row ? $row : false;
    }
}
