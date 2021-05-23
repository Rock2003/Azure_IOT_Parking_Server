var  x = [document.getElementById("1"), document.getElementById("2"), document.getElementById("3")];

var images = [document.getElementById("1x"), document.getElementById("2x"), document.getElementById("3x")];
var redPlants = [];

function isCar(ton) {
    if(ton == 'false') {
        return false;
    } else {
        return true;
    }
}

function changeColor() {
    console.log(redPlants)
    for(var i = 0; i < 3; i++) {
        if(redPlants[i] == false) {
            x[i].style.backgroundColor = 'green';
            images[i].style.opacity = 0;
        } else {
            x[i].style.backgroundColor = 'red';
            images[i].style.opacity = 1;
        }
    }
}

fetch('./file.json')
    .then(results => results.json())
    .then(data => {
        console.log(data);
        redPlants.push(data.lot1);
        redPlants.push(data.lot2);
        redPlants.push(data.lot3);
        console.log(redPlants);
}).then(changeColor);

