<?php
require_once(__DIR__ . "/../config/database.php");

class Location
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getDbInstance()->getConnection();
    }

    public function getLocations(){
        self::verifyTable();

        $locationsList = "
        DECLARE
            TYPE location_varray IS VARRAY(50) OF VARCHAR2(100);
            location_array location_varray := location_varray();
            location_string VARCHAR2(10000);
            counter NUMBER := 0;
            CURSOR location_cursor IS SELECT location_name FROM locations;

            PROCEDURE parse_varray(arr IN location_varray, result OUT VARCHAR2) IS
                BEGIN
                    result := '';
                    FOR i IN 1..arr.COUNT LOOP
                        result := result || arr(i) || ';';
                    END LOOP;
                END;
        BEGIN
            FOR line_locations IN location_cursor LOOP
                    location_array.EXTEND;
                    counter := counter + 1;
                    location_array(counter) := line_locations.location_name;
                END LOOP;

                parse_varray(location_array, location_string);
                :location_result := location_string;
            END;
            ";
        
        $locationsResult = "";
        $locationsListCommand = oci_parse($this->conn, $locationsList);
        oci_bind_by_name($locationsListCommand, ":location_result", $locationsResult, 10000);

        if (!oci_execute($locationsListCommand)) {
            $e = oci_error($locationsListCommand);
            return ["status" => "error", "message" => $e['message']];
        }
        else {
            $locationsArray = array_filter(explode(";", $locationsResult));
            return $locationsArray; 
        }
    }

    public function verifyTable()
    {
        $checkTable = "
        SELECT table_name
        FROM user_tables
        WHERE table_name = UPPER('locations')
    ";

        $checkCommand = oci_parse($this->conn, $checkTable);
        oci_execute($checkCommand);
        $tableExists = oci_fetch_array($checkCommand, OCI_ASSOC + OCI_RETURN_NULLS);

        if (!$tableExists) {
            $createTable = "
            CREATE TABLE locations (
                id NUMBER PRIMARY KEY,
                location_name VARCHAR2(255)
            )
        ";

            $createCommand = oci_parse($this->conn, $createTable);
            if (!oci_execute($createCommand)) {
                $e = oci_error($createCommand);
                echo json_encode(["status" => "error", "message" => "Table creation failed: " . $e['message']]);
                exit;
            }

            $locations = [
                'Alba',
                'Arad',
                'Arges',
                'Bacau',
                'Bihor',
                'Bistrita-Nasaud',
                'Botosani',
                'Brasov',
                'Braila',
                'Bucuresti',
                'Buzau',
                'Caras-Severin',
                'Calarasi',
                'Cluj',
                'Constanta',
                'Covasna',
                'Dambovita',
                'Dolj',
                'Galati',
                'Giurgiu',
                'Gorj',
                'Harghita',
                'Hunedoara',
                'Ialomita',
                'Iasi',
                'Ilfov',
                'Maramures',
                'Mehedinti',
                'Mures',
                'Neamt',
                'Olt',
                'Prahova',
                'Satu Mare',
                'Salaj',
                'Sibiu',
                'Suceava',
                'Teleorman',
                'Timis',
                'Tulcea',
                'Vaslui',
                'Valcea',
                'Vrancea'
            ];

            $insertLocation = "INSERT INTO LOCATIONS(id, location_name) VALUES (:id, :location_name)";
            $insertLocationCommand = oci_parse($this->conn, $insertLocation);

            foreach ($locations as $index => $location) {
                $id = $index + 1;
                oci_bind_by_name($insertLocationCommand, ":id", $id);
                oci_bind_by_name($insertLocationCommand, ":location_name", $location);
                oci_execute($insertLocationCommand);
            }
        }
    }
}
