<?php
require_once(__DIR__ . "/../config/database.php");

class Media
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function saveMediaFiles($newId, $thumbnail, $media)
    {
        self::verifyTableThumbnail();
        self::verifyTableMedia();
        $uploadDir = __DIR__ . '/../../uploads/';

        if (move_uploaded_file($thumbnail['tmp_name'], $uploadDir . $newId . '_' . basename($thumbnail['name']))) {
            $path = 'uploads/' . $newId . '_' . basename($thumbnail['name']);
            $insertEntryMedia = "
            BEGIN
                INSERT INTO THUMBNAIL(id_post, thumbnail_path)
                VALUES(:id_post, :thumbnail_path);
            END;";
            $insertCommandMedia = oci_parse($this->conn, $insertEntryMedia);
            oci_bind_by_name($insertCommandMedia, ":id_post", $newId);
            oci_bind_by_name($insertCommandMedia, ":thumbnail_path", $path);

            if (!oci_execute($insertCommandMedia)) {
                $e = oci_error($insertCommandMedia);
                echo json_encode(["status" => "error", "message" => "Insert failed: " . $e['message']]);
                exit;
            }
        }

        for ($i = 0; $i < count($media['name']); $i++) {
            if (move_uploaded_file($media['tmp_name'][$i], $uploadDir . $newId . '_' . basename($media['name'][$i]))) {
                $path = 'uploads/' . $newId . '_' . basename($media['name'][$i]);
                $insertEntryMedia = "
            BEGIN
                INSERT INTO MEDIA(id_post, file_path)
                VALUES(:id_post, :file_path);
            END;";
                $insertCommandMedia = oci_parse($this->conn, $insertEntryMedia);
                oci_bind_by_name($insertCommandMedia, ":id_post", $newId);
                oci_bind_by_name($insertCommandMedia, ":file_path", $path);

                if (!oci_execute($insertCommandMedia)) {
                    $e = oci_error($insertCommandMedia);
                    echo json_encode(["status" => "error", "message" => "Insert failed: " . $e['message']]);
                    exit;
                }
            }
        }
    }

    public function verifyTableMedia()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('media')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE media (
            id_post NUMBER,
            file_path VARCHAR2(255),
            CONSTRAINT fk_post_id_media FOREIGN KEY (id_post) REFERENCES posts(id))";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }

    public function verifyTableThumbnail()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('thumbnail')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE thumbnail (
            id_post NUMBER,
            thumbnail_path VARCHAR2(255),
            CONSTRAINT fk_post_id_thumb FOREIGN KEY (id_post) REFERENCES posts(id))";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
}
