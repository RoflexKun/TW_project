<?php
require_once(__DIR__ . "/../config/database.php");

class Wishlist
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function getWishlistPosts($userId){
        self::verifyTable();
        $findPostsQuery = "
            DECLARE
                user_id NUMBER := :user_id;
                CURSOR wishlist_cursor IS SELECT * FROM wishlist;
                id_result VARCHAR2(255) := ''; 
            BEGIN
                FOR wishlist_line IN wishlist_cursor LOOP
                    IF wishlist_line.id_user = user_id THEN
                        id_result := id_result || TO_CHAR(wishlist_line.id_post) || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
            END;
                ";
        $idArray = '';
        $findPostsQueryCommand = oci_parse($this->conn, $findPostsQuery);
        
        oci_bind_by_name($findPostsQueryCommand, ":user_id", $userId);
        oci_bind_by_name($findPostsQueryCommand, ":id_result", $idArray, 255);

        if(oci_execute($findPostsQueryCommand)){
            $result = array_filter(explode(';', rtrim($idArray ?? '', ';')));
            return $result;
        }
        else {
            $error = oci_error($findPostsQueryCommand);
            return ["error" => $error['message']];
        }

        
    }

    public function verifyTable(){
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('wishlist')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE wishlist (
            id_user NUMBER,
            id_post NUMBER,
            CONSTRAINT fk_id_post_wishlist FOREIGN KEY (id_post) REFERENCES posts(id),
            CONSTRAINT fk_id_user_wishlist FOREIGN KEY (id_user) REFERENCES users(id))";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
}