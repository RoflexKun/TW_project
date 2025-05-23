<?php
require_once(__DIR__ . "/../config/database.php");

class Post
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function getPostsBySpecies($species)
    {
        $findQuery = "
            DECLARE
                species VARCHAR2(255) := :species;
                CURSOR posts_cursor IS SELECT * FROM posts;
                id_result VARCHAR2(1000) := '';
            BEGIN
                FOR lines IN posts_cursor LOOP
                    IF lines.species = species THEN
                        id_result := id_result || lines.id || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
            END;
        ";
        $idResult = '';
        $findQueryCommand = oci_parse($this->conn, $findQuery);
        oci_bind_by_name($findQueryCommand, ":species", $species);
        oci_bind_by_name($findQueryCommand, ":id_result", $idResult, 1000);

        if (oci_execute($findQueryCommand)) {
            if ($idResult) {
                return ['id' => rtrim($idResult, ';')];
            } else {
                return ['id' => ''];
            }
        } else {
            $error = oci_error($findQueryCommand);
            return ["error" => $error['message']];
        }
    }

    public function getPostsByBreed($breed)
    {
        $findQuery = "
            DECLARE
                breed VARCHAR2(255) := :breed;
                CURSOR posts_cursor IS SELECT * FROM posts;
                id_result VARCHAR2(1000) := '';
            BEGIN
                FOR lines IN posts_cursor LOOP
                    IF lines.breed = breed THEN
                        id_result := id_result || lines.id || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
            END;
        ";
        $idResult = '';
        $findQueryCommand = oci_parse($this->conn, $findQuery);
        oci_bind_by_name($findQueryCommand, ":breed", $breed);
        oci_bind_by_name($findQueryCommand, ":id_result", $idResult, 1000);

        if (oci_execute($findQueryCommand)) {
            if ($idResult) {
                return ['id' => rtrim($idResult, ';')];
            } else {
                return ['id' => ''];
            }
        } else {
            $error = oci_error($findQueryCommand);
            return ["error" => $error['message']];
        }
    }

    public function getPostsBySize($animal_size)
    {
        $findQuery = "
            DECLARE
                animal_size VARCHAR2(255) := :animal_size;
                CURSOR posts_cursor IS SELECT * FROM posts;
                id_result VARCHAR2(1000) := '';
            BEGIN
                FOR lines IN posts_cursor LOOP
                    IF lines.animal_size = animal_size THEN
                        id_result := id_result || lines.id || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
            END;
        ";
        $idResult = '';
        $findQueryCommand = oci_parse($this->conn, $findQuery);
        oci_bind_by_name($findQueryCommand, ":animal_size", $animal_size);
        oci_bind_by_name($findQueryCommand, ":id_result", $idResult, 1000);

        if (oci_execute($findQueryCommand)) {
            if ($idResult) {
                return ['id' => rtrim($idResult, ';')];
            } else {
                return ['id' => ''];
            }
        } else {
            $error = oci_error($findQueryCommand);
            return ["error" => $error['message']];
        }
    }

    public function getPostsByGender($gender)
    {
        $findQuery = "
            DECLARE
                gender VARCHAR2(255) := :gender;
                CURSOR posts_cursor IS SELECT * FROM posts;
                id_result VARCHAR2(1000) := '';
            BEGIN
                FOR lines IN posts_cursor LOOP
                    IF lines.gender = gender THEN
                        id_result := id_result || lines.id || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
            END;
        ";
        $idResult = '';
        $findQueryCommand = oci_parse($this->conn, $findQuery);
        oci_bind_by_name($findQueryCommand, ":gender", $gender);
        oci_bind_by_name($findQueryCommand, ":id_result", $idResult, 1000);

        if (oci_execute($findQueryCommand)) {
            if ($idResult) {
                return ['id' => rtrim($idResult, ';')];
            } else {
                return ['id' => ''];
            }
        } else {
            $error = oci_error($findQueryCommand);
            return ["error" => $error['message']];
        }
    }

    public function getPostsByCity($location)
    {
        $findQuery = "
            DECLARE
                location VARCHAR2(255) := :location;
                CURSOR posts_cursor IS SELECT * FROM posts;
                id_result VARCHAR2(1000) := '';
            BEGIN
                FOR lines IN posts_cursor LOOP
                    IF lines.location = location THEN
                        id_result := id_result || lines.id || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
            END;
        ";
        $idResult = '';
        $findQueryCommand = oci_parse($this->conn, $findQuery);
        oci_bind_by_name($findQueryCommand, ":location", $location);
        oci_bind_by_name($findQueryCommand, ":id_result", $idResult, 1000);

        if (oci_execute($findQueryCommand)) {
            if ($idResult) {
                return ['id' => rtrim($idResult, ';')];
            } else {
                return ['id' => ''];
            }
        } else {
            $error = oci_error($findQueryCommand);
            return ["error" => $error['message']];
        }
    }

    public function getPostsByAge($ageMin, $ageMax)
    {
        $findQuery = "
            DECLARE
                age_min NUMBER := :age_min;
                age_max NUMBER := :age_max;
                CURSOR posts_cursor IS SELECT * FROM posts;
                id_result VARCHAR2(1000) := '';
            BEGIN
                FOR lines IN posts_cursor LOOP
                    IF lines.age BETWEEN age_min AND age_max THEN
                        id_result := id_result || lines.id || ';';
                    END IF;
                END LOOP;
                :id_result := id_result;
            END;
        ";
        $idResult = '';
        $findQueryCommand = oci_parse($this->conn, $findQuery);
        oci_bind_by_name($findQueryCommand, ":age_min", $ageMin);
        oci_bind_by_name($findQueryCommand, ":age_max", $ageMax);
        oci_bind_by_name($findQueryCommand, ":id_result", $idResult, 1000);

        if (oci_execute($findQueryCommand)) {
            if ($idResult) {
                return ['id' => rtrim($idResult, ';')];
            } else {
                return ['id' => ''];
            }
        } else {
            $error = oci_error($findQueryCommand);
            return ["error" => $error['message']];
        }
    }

    public function getPostsById($idArray){
        $nameResult = [];
        $idResult = [];
        $ageResult = [];
        $thumbnailResult = [];
        foreach($idArray as $id){
            $findPost = "
                DECLARE
                    temp_id NUMBER := :id;
                    name_result VARCHAR2(255) := '';
                    age_result VARCHAR2(255) := '';
                    thumbnail VARCHAR2(255) := '';
                BEGIN
                    SELECT name, age INTO name_result, age_result FROM posts WHERE posts.id = temp_id;
                    SELECT thumbnail_path INTO thumbnail FROM thumbnail WHERE id_post = temp_id;
                    :name := name_result;
                    :age := age_result;
                    :thumbnail := thumbnail;
                END;
                ";
                $name = '';
                $age = '';
                $thumbnail = '';

                $findPostCommand = oci_parse($this->conn, $findPost);
                oci_bind_by_name($findPostCommand, ":id", $id);
                oci_bind_by_name($findPostCommand, ":name", $name, 255);
                oci_bind_by_name($findPostCommand, ":age", $age, 255);
                oci_bind_by_name($findPostCommand, ":thumbnail", $thumbnail, 255);

                if(oci_execute($findPostCommand)){
                    $nameResult[] = $name;
                    $ageResult[] = $age;
                    $idResult[] = $id;
                    $thumbnailResult[] = $thumbnail;
                } else {
                    $error = oci_error($findPostCommand);
                    return ["error" => $error['message']];
                }
        }

        return [
            "name" => $nameResult,
            "age" => $ageResult,
            "id" => $idResult,
            "thumbnail" => $thumbnailResult
        ];
    }

    public function insertPost($data, $userId)
    {
        self::verifyTable();
        $name = $data['name'] ?? '';
        $species = $data['species'] ?? '';
        $breed = $data['breed'] ?? '';
        $birthday = $data['birthday'] ?? '';
        $location = $data['location'] ?? '';
        $description = $data['description'] ?? '';
        $animal_size = $data['size'] ?? '';
        $gender = $data['gender'] ?? '';

        $insertEntry = "
    DECLARE
        new_id NUMBER;
        CURSOR iterate_lines IS SELECT * FROM posts;
    BEGIN
        new_id := 1;
        for lines in iterate_lines LOOP
            new_id := new_id + 1;
        END LOOP;
        INSERT INTO POSTS(id, name, species, breed, birthday, age, location, description, animal_size, gender, owner_id)
        VALUES(new_id, :name, :species, :breed, TO_DATE(:birthday, 'YYYY-MM-DD'), TRUNC(MONTHS_BETWEEN(SYSDATE, TO_DATE(:birthday, 'YYYY-MM-DD'))/12), :location, :description, :animal_size, :gender, :owner_id);

        :new_id := new_id;
    END;";

        $new_id = 0;
        $insertCommand = oci_parse($this->conn, $insertEntry);
        oci_bind_by_name($insertCommand, ":name", $name);
        oci_bind_by_name($insertCommand, ":species", $species);
        oci_bind_by_name($insertCommand, ":breed", $breed);
        oci_bind_by_name($insertCommand, ":birthday", $birthday);
        oci_bind_by_name($insertCommand, ":location", $location);
        oci_bind_by_name($insertCommand, ":description", $description);
        oci_bind_by_name($insertCommand, ":animal_size", $animal_size);
        oci_bind_by_name($insertCommand, ":gender", $gender);
        oci_bind_by_name($insertCommand, ":owner_id", $userId);
        oci_bind_by_name($insertCommand, ":new_id", $new_id, 8);

        oci_execute($insertCommand);
        return $new_id;
    }

    public function postInfo($id)
    {
        $extractData = "
    DECLARE
        post_not_found EXCEPTION;
        PRAGMA EXCEPTION_INIT(post_not_found, -20001);
        id_rec NUMBER := :id;
        found BOOLEAN := false;
        post posts%ROWTYPE; 
        TYPE varray IS VARRAY (15) OF VARCHAR2(255);
        media_array varray;
        temp_media_array VARCHAR2(4000) := '';
        thumbnail_string VARCHAR2(255) := '';
        medical_string VARCHAR2(4000) := '';
        food_like_string VARCHAR2(4000) := '';
        food_dislike_string VARCHAR2(4000) := ''; 
        CURSOR posts_lines IS SELECT * FROM posts;
        CURSOR media_lines IS SELECT * FROM media;
        CURSOR medical_lines IS SELECT * FROM medical;
        CURSOR food_like_lines IS SELECT * FROM food_like;
        CURSOR food_dislike_lines IS SELECT * FROM food_dislike;
        count_media NUMBER := 0;
    BEGIN
        SELECT thumbnail_path INTO thumbnail_string FROM thumbnail WHERE id_post = id_rec;
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
            :description := post.description;
            :animal_size := post.animal_size;
            :gender := post.gender;
            media_array := varray();
            FOR lines IN media_lines LOOP
                IF lines.id_post = post.id THEN
                    count_media := count_media + 1;
                    media_array.EXTEND;
                    media_array(count_media):=lines.file_path;
                END IF;
            END LOOP;
            FOR i IN 1..media_array.COUNT LOOP
                temp_media_array := temp_media_array || media_array(i) || ';';
            END LOOP;

            FOR lines IN medical_lines LOOP
                IF lines.id_post = post.id THEN 
                    medical_string := medical_string || lines.medical_problem || ';';
                END IF;
            END LOOP;

            FOR lines IN food_like_lines LOOP
                IF lines.id_post = post.id THEN
                    food_like_string := food_like_string || lines.food_name || ';';
                END IF;
            END LOOP;

            FOR lines IN food_dislike_lines LOOP
                IF lines.id_post = post.id THEN
                    food_dislike_string := food_dislike_string || lines.food_name || ';';
                END IF;
            END LOOP;

            :media_array := temp_media_array;
            :medical_array := medical_string;
            :food_like_array := food_like_string;
            :food_dislike_array := food_dislike_string;
            :thumbnail := thumbnail_string;
        ELSE 
            RAISE post_not_found;
        END IF;
    EXCEPTION
    WHEN post_not_found THEN
        :error := 'Invalid ID';
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
        $thumbnail = "";
        $description = "";
        $animal_size = "";
        $gender = "";
        $mediaArray = "";
        $medicalArray = "";
        $foodLikeArray = "";
        $foodDislikeArray = "";
        $error = "";

        oci_bind_by_name($extractDataCommand, ":name", $name, 50);
        oci_bind_by_name($extractDataCommand, ":species", $species, 50);
        oci_bind_by_name($extractDataCommand, ":breed", $breed, 50);
        oci_bind_by_name($extractDataCommand, ":birthday", $birthday, 10);
        oci_bind_by_name($extractDataCommand, ":age", $age, 3);
        oci_bind_by_name($extractDataCommand, ":location", $location, 50);
        oci_bind_by_name($extractDataCommand, ":thumbnail", $thumbnail, 255);
        oci_bind_by_name($extractDataCommand, ":description", $description, 1000);
        oci_bind_by_name($extractDataCommand, ":animal_size", $animal_size, 255);
        oci_bind_by_name($extractDataCommand, ":gender", $gender, 255);
        oci_bind_by_name($extractDataCommand, ":error", $error, 50);
        oci_bind_by_name($extractDataCommand, ":media_array", $mediaArray, 4000);
        oci_bind_by_name($extractDataCommand, ":medical_array", $medicalArray, 4000);
        oci_bind_by_name($extractDataCommand, ":food_like_array", $foodLikeArray, 4000);
        oci_bind_by_name($extractDataCommand, ":food_dislike_array", $foodDislikeArray, 4000);

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
                    "thumbnail" => $thumbnail,
                    "description" => $description,
                    "animal_size" => $animal_size,
                    "gender" => $gender,
                    "media_array" => rtrim($mediaArray ?? '', ';'),
                    "medical_array" => rtrim($medicalArray ?? '', ';'),
                    "food_like_array" => rtrim($foodLikeArray ?? '', ';'),
                    "food_dislike_array" => rtrim($foodDislikeArray ?? '', ';')
                ];
            }
        }
    }

    public function getPostsFromPage($page, $limit)
    {
        $firstPostIndex = $limit * ($page - 1) + 1;
        $lastPostIndex = $limit * $page;

        $extractPosts = "
            DECLARE
                TYPE varray_name IS VARRAY(10000) OF VARCHAR2(255);
                TYPE varray_age IS VARRAY(10000) OF NUMBER;
                TYPE varray_media IS VARRAY(10000) OF VARCHAR2(255);
                TYPE varray_id IS VARRAY(10000) OF NUMBER;
                first_post_index NUMBER := :firstPostIndex;
                last_post_index NUMBER := :lastPostIndex;
                name_array varray_name := varray_name();
                age_array varray_age := varray_age();
                thumbnail_array varray_media := varray_media();
                id_array varray_id := varray_id();
                name_result VARCHAR2(10000) := '';
                age_result VARCHAR2(10000) := '';
                thumbnail_result VARCHAR2(10000) := '';
                id_result VARCHAR2(10000) := '';
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
                        id_array.EXTEND;

                        name_array(item_counter) := line.name;
                        age_array(item_counter) := line.age;
                        id_array(item_counter) := line.id;

                        BEGIN
                            SELECT thumbnail_path INTO temp_path FROM thumbnail WHERE line.id = id_post AND ROWNUM = 1;
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

                FOR i in 1..id_array.COUNT LOOP
                    id_result := id_result || TO_CHAR(id_array(i)) || ';';
                END LOOP;

                :name_array := name_result;
                :age_array := age_result;
                :thumbnail_array := thumbnail_result;
                :id_array := id_result;
            END;
        ";

        $nameArray = '';
        $ageArray = '';
        $thumbnailArray = '';
        $idArray = '';

        $extractPostsCommand = oci_parse($this->conn, $extractPosts);
        oci_bind_by_name($extractPostsCommand, ":firstPostIndex", $firstPostIndex);
        oci_bind_by_name($extractPostsCommand, ":lastPostIndex", $lastPostIndex);

        oci_bind_by_name($extractPostsCommand, ":name_array", $nameArray, 3000);
        oci_bind_by_name($extractPostsCommand, ":age_array", $ageArray, 3000);
        oci_bind_by_name($extractPostsCommand, ":thumbnail_array", $thumbnailArray, 3000);
        oci_bind_by_name($extractPostsCommand, ":id_array", $idArray, 3000);

        oci_execute($extractPostsCommand);

        return ["names" => rtrim($nameArray, ";"), "ages" => rtrim($ageArray, ";"), "thumbnails" => rtrim($thumbnailArray, ";"), "ids" => rtrim($idArray, ";")];
    }

    public function getPostCount()
    {
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
        } else {
            $error = oci_error($postsCountCommand);
            return ["error" => $error['message']];
        }
    }

    public function getSearchResults($searchInput)
    {
        $searchPosts = "
        DECLARE

            CURSOR posts_cursor IS SELECT * FROM posts;
            CURSOR medical_cursor IS SELECT p.id, p.name, p.age, m.medical_problem FROM posts p JOIN medical m ON p.id = m.id_post;
            CURSOR food_like_cursor IS SELECT p.id, p.name, p.age, fl.food_name FROM posts p JOIN food_like fl ON p.id = fl.id_post;
            CURSOR food_dislike_cursor IS SELECT p.id, p.name, p.age, fd.food_name FROM posts p JOIN food_dislike fd ON p.id = fd.id_post;
            TYPE name_varray IS VARRAY(1000) OF VARCHAR2(255);
            TYPE thumbnail_varray IS VARRAY(1000) OF VARCHAR2(255);
            TYPE id_varray IS VARRAY(1000) OF NUMBER;
            TYPE age_varray IS VARRAY(1000) OF NUMBER;
            TYPE id_seen_type IS TABLE OF BOOLEAN INDEX BY PLS_INTEGER;
            
            name_array name_varray := name_varray();
            id_array id_varray := id_varray();
            age_array age_varray := age_varray();
            thumbnail_array thumbnail_varray := thumbnail_varray();
            id_seen id_seen_type;

            search_input VARCHAR2(255) := :search_input;
            counter NUMBER := 0;
            name_string VARCHAR2(10000);
            id_string VARCHAR2(10000);
            age_string VARCHAR2(10000);
            thumbnail_string VARCHAR2(10000);
            found_match BOOLEAN;
            id_exists BOOLEAN;

            no_match_exception exception;
            PRAGMA EXCEPTION_INIT(no_match_exception, -20001);
        BEGIN
            FOR line_posts IN posts_cursor LOOP
                found_match := FALSE;
                IF LOWER(line_posts.name) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                ELSIF LOWER(line_posts.age) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                ELSIF LOWER(line_posts.species) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                ELSIF LOWER(line_posts.breed) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                ELSIF LOWER(line_posts.location) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                ELSIF LOWER(line_posts.description) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                ELSIF LOWER(line_posts.animal_size) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                ELSIF LOWER(line_posts.gender) LIKE '%' || LOWER(search_input) || '%' THEN
                    found_match := TRUE;
                END IF;

                IF found_match = TRUE THEN
                    IF NOT id_seen.EXISTS(line_posts.id) THEN
                        id_seen(line_posts.id) := TRUE;

                        name_array.EXTEND;
                        id_array.EXTEND;
                        age_array.EXTEND;
                        thumbnail_array.EXTEND;

                        counter := counter + 1;
                        name_array(counter) := line_posts.name;
                        id_array(counter) := line_posts.id;
                        age_array(counter) := line_posts.age;
                        SELECT thumbnail_path INTO thumbnail_array(counter) FROM thumbnail WHERE thumbnail.id_post = line_posts.id;
                    END IF;
                END IF;
            END LOOP;

            FOR line_medical IN medical_cursor LOOP
                found_match := FALSE;
                IF line_medical.medical_problem LIKE '%' || search_input || '%' THEN
                    found_match := TRUE;
                END IF;

                IF found_match = TRUE THEN
                    IF NOT id_seen.EXISTS(line_medical.id) THEN
                        id_seen(line_medical.id) := TRUE;

                        name_array.EXTEND;
                        id_array.EXTEND;
                        age_array.EXTEND;
                        thumbnail_array.EXTEND;

                        counter := counter + 1;
                        name_array(counter) := line_medical.name;
                        id_array(counter) := line_medical.id;
                        age_array(counter) := line_medical.age;
                        SELECT thumbnail_path INTO thumbnail_array(counter) FROM thumbnail WHERE thumbnail.id_post = line_medical.id;
                    END IF;
                END IF;
            END LOOP;

            FOR line_food_like IN food_like_cursor LOOP
                found_match := FALSE;
                IF line_food_like.food_name LIKE '%' || search_input || '%' THEN
                    found_match := TRUE;
                END IF;

                IF found_match = TRUE THEN
                    IF NOT id_seen.EXISTS(line_food_like.id) THEN
                        id_seen(line_food_like.id) := TRUE;

                        name_array.EXTEND;
                        id_array.EXTEND;
                        age_array.EXTEND;
                        thumbnail_array.EXTEND;

                        counter := counter + 1;
                        name_array(counter) := line_food_like.name;
                        id_array(counter) := line_food_like.id;
                        age_array(counter) := line_food_like.age;
                        SELECT thumbnail_path INTO thumbnail_array(counter) FROM thumbnail WHERE thumbnail.id_post = line_food_like.id;
                    END IF;
                END IF;
            END LOOP;

            FOR line_food_dislike in food_dislike_cursor LOOP
                found_match := FALSE;
                IF line_food_dislike.food_name LIKE '%' || search_input || '%' THEN
                    found_match := TRUE;
                END IF;

                IF found_match = TRUE THEN
                    IF NOT id_seen.EXISTS(line_food_dislike.id) THEN
                        id_seen(line_food_dislike.id) := TRUE;

                        name_array.EXTEND;
                        id_array.EXTEND;
                        age_array.EXTEND;
                        thumbnail_array.EXTEND;

                        counter := counter + 1;
                        name_array(counter) := line_food_dislike.name;
                        id_array(counter) := line_food_dislike.id;
                        age_array(counter) := line_food_dislike.age;
                        SELECT thumbnail_path INTO thumbnail_array(counter) FROM thumbnail WHERE thumbnail.id_post = line_food_dislike.id;
                    END IF;
                END IF;
            END LOOP;

            IF counter = 0 THEN
                RAISE no_match_exception;
            ELSE
                FOR i in 1..name_array.COUNT LOOP
                    name_string := name_string || name_array(i) || ';';
                    id_string := id_string || id_array(i) || ';';
                    age_string := age_string || age_array(i) || ';';
                    thumbnail_string := thumbnail_string || thumbnail_array(i) || ';';
                END LOOP;

                :name_array := name_string;
                :id_array := id_string;
                :age_array := age_string;
                :counter := counter;
                :thumbnail_array := thumbnail_string;
            END IF;
        EXCEPTION
        WHEN no_match_exception THEN
            name_string := '';
            id_string := '';
            age_string := '';
            thumbnail_string := '';

            :name_array := name_string;
            :id_array := id_string;
            :age_array := age_string;
            :counter := counter;
            :thumbnail_array := thumbnail_string;
        END;
            ";

        $counter = 0;
        $nameArray = '';
        $idArray = '';
        $ageArray = '';
        $thumbnailArray = '';

        $searchPostsCommand = oci_parse($this->conn, $searchPosts);

        oci_bind_by_name($searchPostsCommand, ":search_input", $searchInput);

        oci_bind_by_name($searchPostsCommand, ":name_array", $nameArray, 10000);
        oci_bind_by_name($searchPostsCommand, ":id_array", $idArray, 10000);
        oci_bind_by_name($searchPostsCommand, ":age_array", $ageArray, 10000);
        oci_bind_by_name($searchPostsCommand, ":counter", $counter, 10);
        oci_bind_by_name($searchPostsCommand, ":thumbnail_array", $thumbnailArray, 10000);

        if (oci_execute($searchPostsCommand)) {
            if ($counter == 0) {
                return [
                    "counter" => $counter,
                    "name" => $nameArray,
                    "id" => $idArray,
                    "age" => $ageArray,
                    "thumbnail" => $thumbnailArray
                ];
            } else {
                return [
                    "counter" => $counter,
                    "name" => rtrim($nameArray, ';'),
                    "id" => rtrim($idArray, ';'),
                    "age" => rtrim($ageArray, ';'),
                    "thumbnail" => rtrim($thumbnailArray, ';')
                ];
            }
        } else {
            $error = oci_error($searchPostsCommand);
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
                location VARCHAR2(100),
                description VARCHAR2(4000),
                animal_size VARCHAR2(255),
                gender VARCHAR2(255),
                owner_id NUMBER,
                CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFERENCES users(id))
                ";
            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }
        }
    }
}
