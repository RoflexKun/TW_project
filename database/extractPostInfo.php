<?php
    require_once(dirname(__FILE__) ."/../database/database.php");

    $id = $_POST['id'] ?? '';
    $extractData = "
    DECLARE
        id_rec NUMBER := :id;
        found BOOLEAN := false;
        post posts%ROWTYPE; 
        TYPE varray IS VARRAY (15) OF VARCHAR2(255);
        media_array varray;
        temp_media_array VARCHAR2(4000) := '';
        CURSOR posts_lines IS SELECT * FROM posts;
        CURSOR media_lines IS SELECT * FROM media;
        count_media NUMBER := 0;
    BEGIN
        FOR lines IN posts_lines LOOP
            IF lines.id = id_rec THEN
                post := lines;
                found := true;
            END IF;
            EXIT WHEN found = true;
        END LOOP;
        IF found = true THEN
            :name := post.name;
            :species := post.species;
            :breed := post.breed;
            :birthday := post.birthday;
            :age := post.age;
            :location := post.location;
            media_array := varray();
            FOR lines IN media_lines LOOP
                IF lines.id_post = post.id THEN
                    count_media := count_media + 1;
                    media_array.EXTEND;
                    media_array(count_media):=lines.file_path;
                END IF;
            END LOOP;
            FOR i in 1..media_array.COUNT LOOP
                temp_media_array := temp_media_array || media_array(i) || ';';
            END LOOP;
            :media_array := temp_media_array;
        ELSE 
            :error := 'Invalid ID';
        END IF;
    END;
    ";

    $extractDataCommand = oci_parse($conn, $extractData);
    oci_bind_by_name($extractDataCommand, ":id", $id);

    $name = "";
    $species = "";
    $breed = "";
    $birthday = "";
    $age = "";
    $location = "";
    $media_array = "";
    $error = "";

    oci_bind_by_name($extractDataCommand, ":name", $name, 50);
    oci_bind_by_name($extractDataCommand,":species", $species, 50);
    oci_bind_by_name($extractDataCommand,":breed", $breed, 50);
    oci_bind_by_name($extractDataCommand, ":birthday", $birthday, 10);
    oci_bind_by_name($extractDataCommand,":age", $age, 3);
    oci_bind_by_name($extractDataCommand,":location", $location, 50);
    oci_bind_by_name($extractDataCommand,":error", $error, 50);
    oci_bind_by_name($extractDataCommand,":media_array", $media_array, 4000);

    if(oci_execute($extractDataCommand))
    {
        if($error != ""){
            echo json_encode(["error" => $error, "receivedId" => $id]);
        }
        else {
            echo json_encode([
            "name" => $name,
            "species" => $species,
            "breed" => $breed,
            "birthday" => $birthday,
            "age" => $age,
            "location" => $location,
            "media_array" => $media_array]);
        }
    }
?>