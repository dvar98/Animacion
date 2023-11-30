const aspiradora = document.querySelector('#graph-container .aspiradora');

const habitaciones = {
  'baseCarga': [230, 218],
  'sala': [230, 120, 1],
  'recamara1': [110, 270, 2],
  'baño': [230, 290, 3],
  'recamara2': [350, 270, 4],
  'pasillo': [230, 218, 5]
};
const bodegas = {
  "bodega1": document.querySelector('#graph-container #sala'),
  "bodega2": document.querySelector('#graph-container #recamara1'),
  "bodega3": document.querySelector('#graph-container #baño'),
  "bodega4": document.querySelector('#graph-container #recamara2')
};
// const statusDiv = document.getElementById("status");
// const batteryStatusDiv = document.getElementById("batteryStatus");
// const bodegasLimpiasDiv = document.getElementById("bodegasLimpias");
const bodegasContadas = new Set();

let bodegasLimpiadas = 0;

let bateria = 100;
let estadoAspiradora = "inactiva";

let ubicacionActual = ['baseCarga', 'baseCarga'];

// document.body.appendChild(statusDiv);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function moverAspiradora(cuarto) {
  return new Promise((resolve) => {
    aspiradora.setAttribute('style', `top:${habitaciones[cuarto][0]}px; left:${habitaciones[cuarto][1]}px`)
    setTimeout(function () {
      ubicacionActual = [ubicacionActual[1], cuarto];
      resolve();
    }, 500);
  });
}

function estadosInicialesAleatorios() {
  const estadosPosibles = ["limpia", "sucia", "libre-limpiar", "ocupada"];
  let index = 1;
  for (const key in bodegas) {
    const bodega = bodegas[key]
    const estadoAleatorio = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
    bodega.className = `bodega${index} ${estadoAleatorio}`;

    const space = document.querySelector(`#statusHabitaciones tr:nth-child(${index + 2}) .status`);
    space.innerHTML = (estadoAleatorio.charAt(0).toUpperCase() + estadoAleatorio.slice(1))

    if (estadoAleatorio === "limpia") {
      bodegasLimpiadas++;
      bodegasContadas.add(bodega);
    }
    index++;
  }
  actualizarBodegasLimpias();
}

function actualizarBodegasLimpias() {
  const space = document.querySelector(`#statusAspiradora tr:nth-child(2) .status`);
  space.innerHTML = `Bodegas Limpias: ${bodegasContadas.size}`;
}

function actualizarEstadoBateria() {
  const batteryStatusDiv = document.querySelector(`#statusAspiradora tr:nth-child(3) .status`);
  const porcentajeBateria = bateria; // Usa la variable bateria aquí
  batteryStatusDiv.innerText = `Batería: ${porcentajeBateria.toFixed(0)}%`;

  if (porcentajeBateria === 100) {
    batteryStatusDiv.innerText += " - Carga completa";
  } else if (porcentajeBateria >= 60) {
    batteryStatusDiv.innerText += " - Carga óptima";
  } else if (porcentajeBateria >= 20) {
    batteryStatusDiv.innerText += " - Carga baja";
  } else {
    batteryStatusDiv.innerText += " - Batería crítica";
  }

  // space.innerHTML = batteryStatusDiv;
}

async function cargarBateria() {
  await moverAspiradora('baseCarga');

  const space = document.querySelector(`#statusAspiradora tr:nth-child(4) .status`);
  space.innerHTML = "En estación de carga.";

  await sleep(2000);
  space.innerHTML = "Cargando...";
  await sleep(2000);
  bateria = 100;
  actualizarEstadoBateria();
  space.innerHTML = "Batería cargada, continuando con la limpieza.";
  await sleep(1500);
  await moverAspiradora(ubicacionActual[0]);
  await ejecutarSimulacion();
}

async function cargarBateriaBaja() {
  const space = document.querySelector(`#statusAspiradora tr:nth-child(4) .status`);
  space.innerHTML = "Batería insuficiente para limpiar bodega, yendo a la estación de carga.";

  await moverAspiradora('baseCarga');
  await sleep(2000);
  space.innerHTML = "Cargando...";
  await sleep(2000);
  space.innerHTML = "Batería cargada, continuando con la limpieza.";
  bateria = 100;
  actualizarEstadoBateria();
  await moverAspiradora(ubicacionActual[0]);
  await ejecutarSimulacion();
}

// async function cambiarEstadoBodegasLimpias() {
//   await sleep(10000);

//   const estadosPosibles = ["sucia", "libre-limpiar", "ocupada"];
//   bodegasContadas.forEach(bodega => {
//     const estadoAleatorio = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
//     bodega.classList.remove("limpia");
//     bodega.classList.add(estadoAleatorio);
//     bodega.innerText = estadoAleatorio.charAt(0).toUpperCase() + estadoAleatorio.slice(1);
//   });
//   bodegasContadas.clear();
// }

async function limpiarBodega(bodega) {
  const statusDiv = document.querySelector(`#statusAspiradora tr:nth-child(4) .status`);

  if (bodega.classList.contains("libre-limpiar") || bodega.classList.contains("sucia")) {

    // aspiradora.style.transform = `translate(${bodega.getBoundingClientRect().top}px, ${bodega.getBoundingClientRect().left}px)`;
    await sleep(1000);
    if (bodega.classList.contains("sucia")) {
      bodega.classList.remove("sucia");
    }
    bodega.classList.remove("libre-limpiar");
    bodega.classList.add("limpia");

    //tabla
    const space = document.querySelector(`#statusHabitaciones tr:nth-child(${habitaciones[bodega.id][2] + 2}) .status`);
    space.innerHTML = 'limpia';
    bateria -= 10;

    if (!bodegasContadas.has(bodega)) {
      bodegasContadas.add(bodega);
      actualizarBodegasLimpias();

      if (bodegasContadas.size % 4 === 0) {
        moverAspiradora('baseCarga')
        statusDiv.innerText = "En base de carga";

        document.timeline.pause(); //¡¡QUE FUNCIÓN MAS BUENA!!
      }
    }

    actualizarEstadoBateria();
    statusDiv.innerText = `Limpiando Bodega ${bodega.textContent}`;
  }
}

async function ejecutarSimulacion() {
  const statusDiv = document.querySelector(`#statusAspiradora tr:nth-child(4) .status`);

  for (const key in bodegas) {
    const bodega = bodegas[key];
    const estadoBodega = bodega.className.split(" ")[1];

    moverAspiradora(bodega.id)
    await sleep(2000);

    if (bateria <= 0.5 && estadoBodega !== "limpia") {
      estadoAspiradora = "inactiva";
      await cargarBateriaBaja();
      estadoAspiradora = "limpiando";
    }

    if (estadoBodega !== "limpia") {
      statusDiv.innerText = `Limpiando ${bodega.id}`;
    }

    switch (estadoBodega) {
      case "libre-limpiar":
      case "sucia":
        if (bateria > 0.5) {
          await limpiarBodega(bodega);
        }
        break;
      case "ocupada":
        statusDiv.innerText = `Bodega Ocupada - Continuando con otra bodega`;
        setTimeout(() => {
          bodega.classList.remove("ocupada");
          bodega.classList.add("libre-limpiar");

          const space = document.querySelector(`#statusHabitaciones tr:nth-child(${habitaciones[bodega.id][2] + 2}) .status`);
          space.innerHTML = "Libre para limpiar";
        }, 3000);
        break;
      case "limpia":
        statusDiv.innerText = `Esta Bodega se encuentra limpia`;
        break;
    }

  }

  if (bateria > 0) {
    moverAspiradora('baseCarga')
    statusDiv.innerText = "En la base de carga";
    await cargarBateria();
    await sleep(2000);
  }
}

document.getElementById('btnIniciar').addEventListener('click', () => {
  bodegasLimpiadas = 0;

  estadosInicialesAleatorios();
  ejecutarSimulacion();
});
