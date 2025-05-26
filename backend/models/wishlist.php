<?php
require_once(__DIR__ . "/../config/database.php");

class Wishlist
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function getPopularPosts(){
        $findPopular = "
            DECLARE
                CURSOR wishlist_cursor IS
                    SELECT id_post, COUNT(*) AS cnt
                    FROM WISHLIST
                    GROUP BY id_post
                    ORDER BY cnt DESC;

                id_string VARCHAR2(4000) := '';
            BEGIN
                FOR wishlist_line IN wishlist_cursor LOOP
                    id_string := id_string || wishlist_line.id_post || ';';
                END LOOP;
                :id_result := id_string;
            END;
            ";

            $idArray = '';
            $findPopularCommand = oci_parse($this->conn, $findPopular);
            oci_bind_by_name($findPopularCommand, ":id_result", $idArray, 4000);
            oci_execute($findPopularCommand);
            return rtrim($idArray ?? '', ';');
    }

    public function getWishlistPosts($userId)
    {
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

        if (oci_execute($findPostsQueryCommand)) {
            $result = array_filter(explode(';', rtrim($idArray ?? '', ';')));
            return $result;
        } else {
            $error = oci_error($findPostsQueryCommand);
            return ["error" => $error['message']];
        }
    }

    public function addWishlistPost($postId, $userId)
    {
        $insertQuery = "
        INSERT INTO WISHLIST(id_user, id_post) VALUES(:id_user, :id_post)";
        $insertQueryCommand = oci_parse($this->conn, $insertQuery);
        oci_bind_by_name($insertQueryCommand, ":id_post", $postId);
        oci_bind_by_name($insertQueryCommand, ":id_user", $userId);

        oci_execute($insertQueryCommand);
    }

    public function removeWishlistPost($postId, $userId)
    {
        $deleteQuery = " 
        DELETE FROM wishlist WHERE id_user = :id_user AND id_post = :id_post";

        $deleteQueryCommand = oci_parse($this->conn, $deleteQuery);

        oci_bind_by_name($deleteQueryCommand, ":id_user", $userId);
        oci_bind_by_name($deleteQueryCommand, ":id_post", $postId);

        oci_execute($deleteQueryCommand);
    }

    public function checkDuplicate($postId, $userid) {
        $checkQuery = "
            DECLARE
                count_post NUMBER;
            BEGIN
                SELECT COUNT(*) INTO count_post FROM wishlist WHERE id_user = :id_user AND id_post = :id_post;
                IF count_post = 0 THEN
                    :duplicate := 0;
                ELSE
                    :duplicate := 1;
                END IF;
            END;
        ";
        $duplicate = 0;
        $checkQueryCommand = oci_parse($this->conn, $checkQuery);
        oci_bind_by_name($checkQueryCommand, ":id_post", $postId);
        oci_bind_by_name($checkQueryCommand, ":id_user", $userid);
        oci_bind_by_name($checkQueryCommand, ":duplicate", $duplicate, 10);

        if(oci_execute($checkQueryCommand)){
            if($duplicate == 0)
                return false;
            else 
                return true;
        }
        
    }

    public function verifyTable()
    {
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
