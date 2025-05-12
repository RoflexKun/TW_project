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

    public function postInfo($id)
    {
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
        oci_bind_by_name($extractDataCommand, ":species", $species, 50);
        oci_bind_by_name($extractDataCommand, ":breed", $breed, 50);
        oci_bind_by_name($extractDataCommand, ":birthday", $birthday, 10);
        oci_bind_by_name($extractDataCommand, ":age", $age, 3);
        oci_bind_by_name($extractDataCommand, ":location", $location, 50);
        oci_bind_by_name($extractDataCommand, ":error", $error, 50);
        oci_bind_by_name($extractDataCommand, ":media_array", $media_array, 4000);

        if (oci_execute($extractDataCommand)) {
            if ($error != "") {
                return ["error" => $error, "receivedId" => $id];
            } else {
                return [
                    "name" => $name,
                    "species" => $species,
                    "breed" => $breed,
                    "birthday" => $birthday,
                    "age" => $age,
                    "location" => $location,
                    "media_array" => $media_array
                ];
            }
        }
    }

    public function getPostsFromPage($page){
        $firstPostIndex = 20 * ($page - 1) + 1;
        $lastPostIndex = 20 * $page;

        $extractPosts = "
            DECLARE
                TYPE varray_name IS VARRAY(20) OF VARCHAR2(255);
                TYPE varray_age IS VARRAY(20) OF NUMBER;
                TYPE varray_media IS VARRAY(20) OF VARCHAR2(255);
                first_post_index NUMBER := :firstPostIndex;
                last_post_index NUMBER := :lastPostIndex;
                name_array varray_name := varray_name();
                age_array varray_age := varray_age();
                thumbnail_array varray_media := varray_media();
                name_result VARCHAR2(10000) := '';
                age_result VARCHAR2(10000) := '';
                thumbnail_result VARCHAR2(10000) := '';
                CURSOR post_line IS SELECT * FROM POSTS;
                counter NUMBER := 1;
                item_counter NUMBER := 1;
                temp_path VARCHAR2(255);
            BEGIN
                FOR line IN post_line LOOP
                    IF counter >= first_post_index AND counter <= last_post_index THEN
                        name_array.EXTEND;
                        age_array.EXTEND;
                        thumbnail_array.EXTEND;

                        name_array(item_counter) := line.name;
                        age_array(item_counter) := line.age;

                        BEGIN
                            SELECT file_path INTO temp_path FROM media WHERE line.id = id_post AND ROWNUM = 1;
                        EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                            temp_path := NULL;
                        END;

                        thumbnail_array(item_counter) := temp_path;
                        item_counter := item_counter + 1;
                    END IF;
                    counter := counter + 1;
                END LOOP;

                FOR i IN 1..name_array.COUNT LOOP
                    name_result := name_result || name_array(i) || ';';
                END LOOP;

                FOR i IN 1..age_array.COUNT LOOP
                    age_result := age_result || TO_CHAR(age_array(i)) || ';';
                END LOOP;

                FOR i IN 1..thumbnail_array.COUNT LOOP
                    thumbnail_result := thumbnail_result || thumbnail_array(i) || ';';
                END LOOP;

                :name_array := name_result;
                :age_array := age_result;
                :thumbnail_array := thumbnail_result;
            END;
        ";
      
        $nameArray = '';
        $ageArray = '';
        $thumbnailArray = '';

        $extractPostsCommand = oci_parse($this->conn, $extractPosts);
        oci_bind_by_name($extractPostsCommand, ":firstPostIndex", $firstPostIndex);
        oci_bind_by_name($extractPostsCommand, ":lastPostIndex", $lastPostIndex);

        oci_bind_by_name($extractPostsCommand, ":name_array", $nameArray, 3000);
        oci_bind_by_name($extractPostsCommand, ":age_array", $ageArray, 3000);
        oci_bind_by_name($extractPostsCommand, ":thumbnail_array", $thumbnailArray, 3000);

        oci_execute($extractPostsCommand);

        return ["names" => rtrim($nameArray, ";"), "ages" => rtrim($ageArray, ";"), "thumbnails" => rtrim($thumbnailArray, ";")];

    }

    public function getPostCount(){
        $postsCount = "
        BEGIN
            SELECT COUNT(*) INTO :number_posts from posts;
        END;
        ";
        $postsCountCommand = oci_parse($this->conn, $postsCount);
        $count = 0;
        oci_bind_by_name($postsCountCommand, ":number_posts", $count, 3);
        if (oci_execute($postsCountCommand)) {
                return [
                    "count" => $count
                ];
            } else{
                $error = oci_error($postsCountCommand);
                return ["error" => $error['message']];
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
