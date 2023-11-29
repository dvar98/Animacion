//[top,left]
let habitaciones = {
    'baseCarga': [230, 218],
    'sala': [230, 120],
    'recamara1': [110, 270],
    'baño': [230, 290],
    'recamara2': [350, 270],
    'pasillo': [230, 218]
};

let aspiradora = document.querySelector('#graph-container .aspiradora');

let sala = document.querySelector('#graph-container .sala');
let recamara1 = document.querySelector('#graph-container .recamara1');
let baño = document.querySelector('#graph-container .baño');
let pasillo = document.querySelector('#graph-container .pasillo');
let recamara2 = document.querySelector('#graph-container .recamara2');

document.getElementById('btnIniciar').addEventListener('click', () => {
    moverAspiradora('pasillo')
        .then(() => {
            moverAspiradora('recamara2')
        })
});

function moverAspiradora(cuarto) {
    return new Promise((resolve) => {
        aspiradora.setAttribute('style', `top:${habitaciones[cuarto][0]}px; left:${habitaciones[cuarto][1]}px`)
        setTimeout(function () {
            resolve();
        }, 500);
    });
}

function changeColorState(state, habitacion) {
    switch (state) {
        case 'limpiar':

    }
}