async function extractData(){

    const formData = new FormData();
    var name = document.getElementById('name').value;
    formData.append('name', name);
    var species = document.getElementById('species').value;
    formData.append('species', species);
    var breed = document.getElementById('breed').value;
    formData.append('breed', breed);
    var birthday = document.getElementById('birthday').value;
    formData.append('birthday', birthday);
    var location = document.getElementById('location').value;
    formData.append('location', location);

    const files = document.getElementById('media').files;
    for(let i = 0; i < files.length; i++){
        formData.append('media[]', files[i]);
    }

    try{
        var response = await fetch("http://localhost/database/newPostTable.php", {
            method: "POST",
            body: formData
        });

        var result = await response.text();

        console.log(result);
    }catch(error){
        console.log(error);
    }

}