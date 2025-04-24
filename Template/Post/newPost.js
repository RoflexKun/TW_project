async function extractData(){
    var name = document.getElementById('name').value;
    var species = document.getElementById('species').value;
    var breed = document.getElementById('breed').value;
    var age = document.getElementById('age').value;

    var newEntry = { 
        name: name,
        species: species, 
        breed: breed, 
        age: age
    };

    console.log(newEntry);
    try{
        var response = await fetch("http://localhost/database/postTable.php", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(newEntry)
        });

        var result = await response.text();

        console.log(result);
    }catch(error){
        console.log(error);
    }

}