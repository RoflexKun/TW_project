<?php
    function checkTablePOSTS($conn){
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('posts')
        ";
        $checkCommand = oci_parse($conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if(!$tableExists){
            $createTable = "
            CREATE TABLE posts (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(100),
                species VARCHAR2(100),
                breed VARCHAR2(100),
                birthday DATE,
                age NUMBER,
                location VARCHAR2(100))";
            $createCommand = oci_parse($conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }

    require_once(__DIR__.'/../database/database.php');
    checkTablePOSTS($conn);
    $data = json_decode(file_get_contents('php://input'), true);

    $name = $data['name'] ?? '';
    $species = $data['species'] ?? '';
    $breed = $data['breed'] ?? '';
    $birthday = $data['birthday'] ??'';
    $location = $data['location'] ??'';

    $insertEntry = "
    DECLARE
        new_id NUMBER;
        CURSOR iterate_lines IS SELECT * FROM posts;
    BEGIN
        new_id := 1;
        for lines in iterate_lines LOOP
            new_id := new_id + 1;
        END LOOP;
        INSERT INTO POSTS(id, name, species, breed, birthday, age, location)
        VALUES(new_id, :name, :species, :breed, TO_DATE(:birthday, 'YYYY-MM-DD'), TRUNC(MONTHS_BETWEEN(SYSDATE, TO_DATE(:birthday, 'YYYY-MM-DD'))/12), :location);
    END;";

    $insertCommand = oci_parse($conn, $insertEntry);

    oci_bind_by_name($insertCommand, ":name", $name);
    oci_bind_by_name($insertCommand, ":species", $species);
    oci_bind_by_name($insertCommand, ":breed", $breed);
    oci_bind_by_name($insertCommand, ":birthday", $birthday);
    oci_bind_by_name($insertCommand, ":location", $location);


    if(oci_execute($insertCommand)){
        echo json_encode(["status" => "success"]);   
    }
    else 
    {
        $e = oci_error($insertCommand);
        echo json_encode(["status" => "error","message"=> $e['message']]);
    }

?>