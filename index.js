var  x1 = document.getElementById("1");
var  x2 = document.getElementById("2");
var  x3 = document.getElementById("3");

fetch('./file.json')
    .then(results => results.json())
    .then(data => {
        console.log(data);
        x1.innerHTML = data.lot1;
        x2.innerHTML = data.lot2;
        x3.innerHTML = data.lot3;
    });
