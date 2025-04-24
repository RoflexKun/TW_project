<?php

    function checkTableMEDIA($conn){
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('media')
        ";

        $checkCommand = oci_parse($conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);
        
        if(!$tableExists){
            $createTable = "
            CREATE TABLE media (
            id_post NUMBER,
            file_path VARCHAR2(255),
            CONSTRAINT fk_post_id FOREIGN KEY (id_post) REFERENCES posts(id))";

            $createCommand = oci_parse($conn, $createTable);
            if(!oci_execute($createCommand)){
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
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
    checkTableMEDIA($conn);
    $name = $_POST['name'] ?? '';
    $species = $_POST['species'] ?? '';
    $breed = $_POST['breed'] ?? '';
    $birthday = $_POST['birthday'] ?? '';
    $location = $_POST['location'] ?? '';
    $files = $_FILES['media'];

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

        :new_id := new_id;
    END;";

    $new_id = 0;
    $insertCommand = oci_parse($conn, $insertEntry);
    oci_bind_by_name($insertCommand, ":name", $name);
    oci_bind_by_name($insertCommand, ":species", $species);
    oci_bind_by_name($insertCommand, ":breed", $breed);
    oci_bind_by_name($insertCommand, ":birthday", $birthday);
    oci_bind_by_name($insertCommand, ":location", $location);
    oci_bind_by_name($insertCommand, ":new_id", $new_id, 8);

    if(oci_execute($insertCommand)){
        echo json_encode(["status" => "success"]);   
    }
    else 
    {
        $e = oci_error($insertCommand);
        echo json_encode(["status" => "error","message"=> $e['message']]);
    }

    $uploadDir = __DIR__.'/../uploads/';

    for($i = 0; $i < count($files['name']); $i++){
        if(move_uploaded_file($files['tmp_name'][$i], $uploadDir.$new_id.'_'.basename($files['name'][$i]))){
            $path = 'uploads/'.$new_id.'_'.basename($files['name'][$i]);
            $insertEntryMedia = "
            BEGIN
                INSERT INTO MEDIA(id_post, file_path)
                VALUES(:id_post, :file_path);
            END;";
            $insertCommandMedia = oci_parse($conn, $insertEntryMedia);
            oci_bind_by_name($insertCommandMedia, ":id_post", $new_id);
            oci_bind_by_name($insertCommandMedia, ":file_path", $path);

            oci_execute($insertCommandMedia);
        }
    }
    

?>