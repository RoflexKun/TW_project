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

    public function getTickets($status){
        self::verifyTable();
        $findTicketsQuery = "
            DECLARE
                status_filter VARCHAR2(255) := :status;
                CURSOR tickets_cursor IS SELECT * FROM ticket;
                id_result VARCHAR2(4000) := '';
                subject_result VARCHAR2(4000) := '';
                post_id_result VARCHAR2(4000) := '';
                description_result VARCHAR2(4000) := '';
                status_result VARCHAR2(4000) := '';
            BEGIN
                FOR tickets_line IN tickets_cursor LOOP
                    IF status_filter IS NOT NULL AND tickets_line.status = status_filter THEN
                        id_result := id_result || tickets_line.id || ';';
                        subject_result := subject_result || tickets_line.subject || ';';
                        IF tickets_line.post_id IS NOT NULL THEN
                            post_id_result := post_id_result || tickets_line.post_id || ';';
                        ELSE
                            post_id_result := post_id_result || '-1' || ';';
                        END IF;
                        description_result := description_result || tickets_line.description || ';';
                        status_result := status_result || tickets_line.status || ';';
                    ELSIF status_filter IS NULL THEN
                        id_result := id_result || tickets_line.id || ';';
                        subject_result := subject_result || tickets_line.subject || ';';
                        IF tickets_line.post_id IS NOT NULL THEN
                            post_id_result := post_id_result || tickets_line.post_id || ';';
                        ELSE
                            post_id_result := post_id_result || '-1' || ';';
                        END IF;
                        description_result := description_result || tickets_line.description || ';';
                        status_result := status_result || tickets_line.status || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
                :subject_result := subject_result;
                :post_id_result := post_id_result;
                :description_result := description_result;
                :status_result := status_result;
            END;
            ";
            $idArray = '';
            $subjectArray = '';
            $postIdArray = '';
            $descriptionArray = '';
            $statusArray = '';
            $findTicketsQueryCommand = oci_parse($this->conn, $findTicketsQuery);
            oci_bind_by_name($findTicketsQueryCommand, ":status", $status);
            oci_bind_by_name($findTicketsQueryCommand, ":id_result", $idArray, 4000);
            oci_bind_by_name($findTicketsQueryCommand, ":subject_result", $subjectArray, 4000);
            oci_bind_by_name($findTicketsQueryCommand, ":post_id_result", $postIdArray, 4000);
            oci_bind_by_name($findTicketsQueryCommand, ":description_result", $descriptionArray, 4000);
            oci_bind_by_name($findTicketsQueryCommand, ":status_result", $statusArray, 4000);

            if(oci_execute($findTicketsQueryCommand)){
                return [
                    "subject" => rtrim($subjectArray ?? '', ';'),
                    "id" => rtrim($idArray ?? '', ';'),
                    "post_id" => rtrim($postIdArray ?? '', ';'),
                    "description" => rtrim($descriptionArray ?? '', ';'),
                    "status" => rtrim($statusArray ?? '', ';')
                ];
            }
    }

    public function updateTicketStatus($ticketId, $status){
        $updateQuery = "
            BEGIN
                UPDATE ticket SET status = :status WHERE id = :ticket_id;
            END;
            ";
        $updateQueryCommand = oci_parse($this->conn, $updateQuery);
        oci_bind_by_name($updateQueryCommand, ":status", $status);
        oci_bind_by_name($updateQueryCommand, ":ticket_id", $ticketId);

        oci_execute($updateQueryCommand);
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