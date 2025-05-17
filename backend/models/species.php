<?php
require_once(__DIR__ . "/../config/database.php");

class Species
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    /*
    Admin dashboard idea: a method do add species beside the default ones
    */

    public function getSpecies()
    {
        self::verifyTable();

        $speciesList = "
            DECLARE
                TYPE species_varray IS VARRAY(100) OF VARCHAR2(255);
                TYPE id_varray IS VARRAY(100) OF NUMBER;
                species_array species_varray := species_varray();
                id_array id_varray := id_varray();
                species_string VARCHAR2(10000) := '';
                id_string VARCHAR2(10000) := '';
                CURSOR species_cursor IS SELECT id_species, species_name FROM species;
                counter NUMBER := 0;

                PROCEDURE parse_varray(arr IN species_varray, result OUT VARCHAR2) IS
                BEGIN
                    result := '';
                    FOR i IN 1..arr.COUNT LOOP
                        result := result || arr(i) || ';';
                    END LOOP;
                END;

                PROCEDURE parse_varray_id(arr IN id_varray, result OUT VARCHAR2) IS
                BEGIN
                    result := '';
                    FOR i IN 1..arr.COUNT LOOP
                        result := result || TO_CHAR(arr(i)) || ';';
                    END LOOP;
                END;
            BEGIN
                FOR line_species IN species_cursor LOOP
                    species_array.EXTEND;
                    id_array.EXTEND;
                    counter := counter + 1;
                    species_array(counter) := line_species.species_name;
                    id_array(counter) :=line_species.id_species;
                END LOOP;

                parse_varray(species_array, species_string);
                parse_varray_id (id_array, id_string);
                :species_result := species_string;
                :id_result := id_string;
            END;
            ";

        $speciesResult = "";
        $idResult = "";
        $speciesListCommand = oci_parse($this->conn, $speciesList);
        oci_bind_by_name($speciesListCommand, ":species_result", $speciesResult, 10000);
        oci_bind_by_name($speciesListCommand, ":id_result", $idResult, 10000);

        if (!oci_execute($speciesListCommand)) {
            $e = oci_error($speciesListCommand);
            return ["status" => "error", "message" => $e['message']];
        } else {
            $speciesArray = array_filter(explode(";", rtrim($speciesResult, ";")));
            $idArray = array_filter(explode(";", rtrim($idResult, ";")));

            return [
                "names" => $speciesArray,
                "ids" => $idArray
            ];
        }
    }

    public function verifyTable()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('species')
        ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE species (
            id_species NUMBER PRIMARY KEY,
            species_name VARCHAR2(255))";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }

            $speciesList = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Snake', 'Hamster'];
            $insertQuery = "INSERT INTO species (id_species, species_name) VALUES (:id, :name)";
            $insertCommand = oci_parse($this->conn, $insertQuery);

            foreach ($speciesList as $index => $name) {
                $id = $index + 1;
                oci_bind_by_name($insertCommand, ":id", $id);
                oci_bind_by_name($insertCommand, ":name", $name);
                if (!oci_execute($insertCommand)) {
                    $e = oci_error($insertCommand);
                    echo json_encode(["status" => "error", "message" => "Insert species failed: " . $e['message']]);
                    exit;
                }
            }
        }
    }
}
