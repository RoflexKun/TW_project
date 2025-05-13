<?php
require_once(__DIR__."/../config/database.php");

class Media {
    private $conn;

    public function __construct() {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function saveMediaFiles($newId, $files){
        self::verifyTable();
        $uploadDir = __DIR__.'/../../uploads/';

    for($i = 0; $i < count($files['name']); $i++){
        if(move_uploaded_file($files['tmp_name'][$i], $uploadDir.$newId.'_'.basename($files['name'][$i]))){
            $path = 'uploads/'.$newId.'_'.basename($files['name'][$i]);
            $insertEntryMedia = "
            BEGIN
                INSERT INTO MEDIA(id_post, file_path)
                VALUES(:id_post, :file_path);
            END;";
            $insertCommandMedia = oci_parse($this->conn, $insertEntryMedia);
            oci_bind_by_name($insertCommandMedia, ":id_post", $newId);
            oci_bind_by_name($insertCommandMedia, ":file_path", $path);

            oci_execute($insertCommandMedia);
        }
    }
    }

    public function verifyTable(){
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('media')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);
        
        if(!$tableExists){
            $createTable = "
            CREATE TABLE media (
            id_post NUMBER,
            file_path VARCHAR2(255),
            CONSTRAINT fk_post_id FOREIGN KEY (id_post) REFERENCES posts(id))";

            $createCommand = oci_parse($this->conn, $createTable);
            if(!oci_execute($createCommand)){
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }

    

}
?>