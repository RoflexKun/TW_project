<?php
require_once(__DIR__ . "/../config/database.php");

class Medical
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function saveMedicalHistory($newId, $medicalTags)
    {
        if (empty($medicalTags))
            return;

        self::verifyTable();
        foreach ($medicalTags as $tag) {
            $tag = trim($tag);

            $insertTag = "
                BEGIN
                    INSERT INTO medical (id_post, medical_problem)
                    VALUES (:id_post, :medical_problem);
                END;
                ";

            $insertTagCommand = oci_parse($this->conn, $insertTag);
            oci_bind_by_name($insertTagCommand, ":id_post", $newId);
            oci_bind_by_name($insertTagCommand, ":medical_problem", $tag);

            if (!oci_execute($insertTagCommand)) {
                $e = oci_error($insertTagCommand);
                echo json_encode(["status" => "error", "message" => "Insert medical history failed: " . $e['message']]);
                exit;
            }
        }
    }

    public function verifyTable()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('medical')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE medical (
            id_post NUMBER,
            medical_problem VARCHAR2(255),
            CONSTRAINT fk_post_id_medical FOREIGN KEY (id_post) REFERENCES posts(id))";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
}
