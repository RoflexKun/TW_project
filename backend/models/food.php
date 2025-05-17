<?php
require_once(__DIR__ . "/../config/database.php");

class Food
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function saveFoodLike($newId, $foodLikeTags){
        if (empty($foodLikeTags))
            return;

        self::verifyTableLike();
        foreach ($foodLikeTags as $tag) {
            $tag = trim($tag);

            $insertTag = "
                BEGIN
                    INSERT INTO food_like (id_post, food_name)
                    VALUES (:id_post, :food_name);
                END;
                ";

            $insertTagCommand = oci_parse($this->conn, $insertTag);
            oci_bind_by_name($insertTagCommand, ":id_post", $newId);
            oci_bind_by_name($insertTagCommand, ":food_name", $tag);

            if (!oci_execute($insertTagCommand)) {
                $e = oci_error($insertTagCommand);
                echo json_encode(["status" => "error", "message" => "Insert food like failed: " . $e['message']]);
                exit;
            }
        }
    }

    public function saveFoodDislike($newId, $foodDislikeTags){
        if (empty($foodDislikeTags))
            return;

        self::verifyTableDislike();
        foreach ($foodDislikeTags as $tag) {
            $tag = trim($tag);

            $insertTag = "
                BEGIN
                    INSERT INTO food_dislike (id_post, food_name)
                    VALUES (:id_post, :food_name);
                END;
                ";

            $insertTagCommand = oci_parse($this->conn, $insertTag);
            oci_bind_by_name($insertTagCommand, ":id_post", $newId);
            oci_bind_by_name($insertTagCommand, ":food_name", $tag);

            if (!oci_execute($insertTagCommand)) {
                $e = oci_error($insertTagCommand);
                echo json_encode(["status" => "error", "message" => "Insert food dislike failed: " . $e['message']]);
                exit;
            }
        }
    }

    public function verifyTableLike()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('food_like')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE food_like (
            id_post NUMBER,
            food_name VARCHAR2(255),
            CONSTRAINT fk_post_id_food_like FOREIGN KEY (id_post) REFERENCES posts(id))";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }

    public function verifyTableDislike() {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('food_dislike')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE food_dislike (
            id_post NUMBER,
            food_name VARCHAR2(255),
            CONSTRAINT fk_post_id_food_dislike FOREIGN KEY (id_post) REFERENCES posts(id))";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
}
