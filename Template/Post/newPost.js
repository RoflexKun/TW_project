async function extractData(){
    var name = document.getElementById('name').value;
    var species = document.getElementById('species').value;
    var breed = document.getElementById('breed').value;
    var birthday = document.getElementById('birthday').value;
    var location = document.getElementById('location').value

    var newEntry = { 
        name: name,
        species: species, 
        breed: breed, 
        birthday: birthday,
        location: location
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