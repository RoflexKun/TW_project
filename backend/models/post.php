<?php
require_once(__DIR__ . "/../config/database.php");

class Post
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function insertPost($data)
    {
        self::verifyTable();
        $name = $data['name'] ?? '';
        $species = $data['species'] ?? '';
        $breed = $data['breed'] ?? '';
        $birthday = $data['birthday'] ?? '';
        $location = $data['location'] ?? '';

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
        $insertCommand = oci_parse($this->conn, $insertEntry);
        oci_bind_by_name($insertCommand, ":name", $name);
        oci_bind_by_name($insertCommand, ":species", $species);
        oci_bind_by_name($insertCommand, ":breed", $breed);
        oci_bind_by_name($insertCommand, ":birthday", $birthday);
        oci_bind_by_name($insertCommand, ":location", $location);
        oci_bind_by_name($insertCommand, ":new_id", $new_id, 8);

        oci_execute($insertCommand);
        return $new_id;
    }

    public function postInfo($id) {
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

    $extractDataCommand = oci_parse($this->conn, $extractData);
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
            return["error" => $error, "receivedId" => $id];
        }
        else {
            return [
            "name" => $name,
            "species" => $species,
            "breed" => $breed,
            "birthday" => $birthday,
            "age" => $age,
            "location" => $location,
            "media_array" => $media_array];
        }
    }
    }

    public function verifyTable()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('posts')
        ";
        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE posts (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(100),
                species VARCHAR2(100),
                breed VARCHAR2(100),
                birthday DATE,
                age NUMBER,
                location VARCHAR2(100))";
            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
}
