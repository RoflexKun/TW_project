<?php
require_once(__DIR__ . "/../config/database.php");

class Breed
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function addBreed($breed, $speciesId){
        $addQuery = "
            DECLARE
                new_id NUMBER := 0;
            BEGIN
                SELECT NVL(MAX(id_breed), 0) + 1 INTO new_id FROM breeds;
                INSERT INTO breeds(id_breed, id_species, breed_name) VALUES(new_id, :species_id, :breed_name);
            END;
            ";
        $addQueryCommand = oci_parse($this->conn, $addQuery);
        oci_bind_by_name($addQueryCommand, ":species_id", $speciesId);
        oci_bind_by_name($addQueryCommand, ":breed_name", $breed);
        oci_execute($addQueryCommand);
    }

    public function getBreedBySpecies($speciesId)
    {
        self::verifyTable();
        $breedList = "
            DECLARE
                TYPE breed_varray IS VARRAY(100) OF VARCHAR2(255);
                breed_array breed_varray := breed_varray();
                breed_string VARCHAR2(10000) := '';
                counter NUMBER := 0;
                CURSOR breed_cursor IS SELECT breed_name FROM breeds WHERE id_species = :species_id;

                PROCEDURE parse_varray(arr IN breed_varray, result OUT VARCHAR2) IS
                BEGIN
                    result := '';
                    FOR i IN 1..arr.COUNT LOOP
                        result := result || arr(i) || ';';
                    END LOOP;
                END;

            BEGIN
                FOR line_breed IN breed_cursor LOOP
                    breed_array.EXTEND;
                    counter := counter + 1;
                    breed_array(counter) := line_breed.breed_name;
                END LOOP;
                parse_varray(breed_array, breed_string);
                :breed_result := breed_string;
            END;
            ";

    $breedResult = "";
    $breedListCommand = oci_parse($this->conn, $breedList);
    oci_bind_by_name($breedListCommand, ":species_id", $speciesId);
    oci_bind_by_name($breedListCommand, ":breed_result", $breedResult, 10000);

    if (!oci_execute($breedListCommand)) {
        $e = oci_error($breedListCommand);
        return ["status" => "error", "message" => $e['message']];
    }
    else{
       $breeds = array_filter(explode(';', $breedResult));
    return $breeds; 
    }
    }

    public function verifyTable()
{
    $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('breeds')
    ";

    $checkCommand = oci_parse($this->conn, $checkTable);
    oci_execute($checkCommand);
    $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

    if (!$tableExists) {
        $createTable = "
            CREATE TABLE breeds (
                id_breed NUMBER,
                id_species NUMBER,
                breed_name VARCHAR2(255),
                CONSTRAINT fk_breed_id FOREIGN KEY (id_species) REFERENCES species(id_species)
            )
        ";

        $createCommand = oci_parse($this->conn, $createTable);
        if (!oci_execute($createCommand)) {
            $e = oci_error($createCommand);
            echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
            exit;
        }

        $breeds = [
            1 => ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Bichon'],
            2 => ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Sphynx'],
            3 => ['Budgie', 'Chicken', 'Cockatiel', 'Canary', 'Pidgeon']
        ];

        $insertBreed = "INSERT INTO breeds (id_breed, id_species, breed_name) VALUES (:id_breed, :id_species, :breed_name)";
        $insertCommand = oci_parse($this->conn, $insertBreed);
        $breedId = 1;

        foreach ($breeds as $speciesId => $breedList) {
            foreach ($breedList as $breedName) {
                oci_bind_by_name($insertCommand, ":id_breed", $breedId);
                oci_bind_by_name($insertCommand, ":id_species", $speciesId);
                oci_bind_by_name($insertCommand, ":breed_name", $breedName);
                if (!oci_execute($insertCommand)) {
                    $e = oci_error($insertCommand);
                    echo json_encode(["status" => "error", "message" => "Insert breed failed: " . $e['message']]);
                    exit;
                }
                $breedId++;
            }
        }
    }
}
}
