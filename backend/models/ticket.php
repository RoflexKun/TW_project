<?php
require_once(__DIR__ . "/../config/database.php");

class Ticket
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function createTicket($postId, $subject, $description){
        self::verifyTable();
        $createTicketQuery = "
            DECLARE
                new_id NUMBER;
            BEGIN
                SELECT NVL(MAX(id), 0) + 1 INTO new_id FROM ticket;
                INSERT INTO ticket (id, subject, description, post_id, status)
                VALUES (new_id, :subject, :description, :postId, 'PENDING');
            END;
            ";
        $createTicketQueryCommand = oci_parse($this->conn, $createTicketQuery);
        oci_bind_by_name($createTicketQueryCommand, ":subject", $subject);
        oci_bind_by_name($createTicketQueryCommand, ":description", $description);
        oci_bind_by_name($createTicketQueryCommand, ":postId", $postId);

        oci_execute($createTicketQueryCommand);
    }

    public function verifyTable()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('ticket')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE ticket (
                id NUMBER,
                subject VARCHAR2(500),
                description VARCHAR2(4000),
                post_id NUMBER,
                status VARCHAR2(255)
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