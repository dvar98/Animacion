const aspiradora = document.querySelector(".aspiradora");
const bodegas = {
  "bodega1": document.querySelectorAll("#bodega1"),
  "bodega2": document.querySelectorAll("#bodega2"),
  "bodega3": document.querySelectorAll("#bodega3"),
  "bodega4": document.querySelectorAll("#bodega4")
};
const statusDiv = document.createElement("div");
const batteryStatusDiv = document.getElementById("batteryStatus");
const bodegasLimpiasDiv = document.getElementById("bodegasLimpias");
const bodegasContadas = new Set();

let bodegasLimpiadas = 0;

let bateria = 100;
let estadoAspiradora = "inactiva";

document.body.appendChild(statusDiv);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function moverAspiradora(destX, destY) {
  aspiradora.style.transform = `translate(${destX}px, ${destY}px)`;
  await sleep(4000);
}

function estadosInicialesAleatorios() {
  for (const key in bodegas) {
    bodegas[key].forEach(bodega => {
      const estadosPosibles = ["limpia", "sucia", "libre-limpiar", "ocupada"];
      const estadoAleatorio = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
      bodega.className = `bodega ${estadoAleatorio}`;
      bodega.innerText = estadoAleatorio.charAt(0).toUpperCase() + estadoAleatorio.slice(1);

      if (estadoAleatorio === "limpia") {
        bodegasLimpiadas++;
        bodegasContadas.add(bodega);
      }
    });
  }
  actualizarBodegasLimpias();
}

function actualizarBodegasLimpias() {
  bodegasLimpiasDiv.innerText = `Bodegas Limpias: ${bodegasContadas.size}`;
}

function actualizarEstadoBateria() {
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
}

async function cargarBateria() {
  statusDiv.innerText = "Aspiradora: en estación de carga.";
  await moverAspiradora(500, 600);
  await sleep(2000);
  statusDiv.innerText = "Aspiradora: Cargando...";
  await sleep(2000);
  bateria = 100;
  actualizarEstadoBateria();
  statusDiv.innerText = "Aspiradora: Batería cargada, continuando con la limpieza.";
  await sleep(1500);
  await moverAspiradora(bodegas["bodega1"][0].offsetTop, bodegas["bodega1"][0].offsetLeft);
  await ejecutarSimulacion();
}

async function cargarBateriaBaja() {
  statusDiv.innerText = "Aspiradora: Batería insuficiente para limpiar bodega, yendo a la estación de carga.";
  await moverAspiradora(500, 600);
  await sleep(2000);
  statusDiv.innerText = "Aspiradora: Cargando...";
  await sleep(2000);
  statusDiv.innerText = "Aspiradora: Batería cargada, continuando con la limpieza.";
  bateria = 100;
  actualizarEstadoBateria();
  await moverAspiradora(bodegas["bodega1"][0].offsetTop, bodegas["bodega1"][0].offsetLeft);
  await ejecutarSimulacion();
}

async function cambiarEstadoBodegasLimpias() {
  await sleep(10000);

  bodegasContadas.forEach(bodega => {
    const estadosPosibles = ["sucia", "libre-limpiar", "ocupada"];
    const estadoAleatorio = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
    bodega.classList.remove("limpia");
    bodega.classList.add(estadoAleatorio);
    bodega.innerText = estadoAleatorio.charAt(0).toUpperCase() + estadoAleatorio.slice(1);
  });
  bodegasContadas.clear();
}

async function limpiarBodega(bodega) {
  if (bodega.classList.contains("libre-limpiar") || bodega.classList.contains("sucia")) {
    aspiradora.style.transform = `translate(${bodega.getBoundingClientRect().top}px, ${bodega.getBoundingClientRect().left}px)`;
    await sleep(1000);
    if (bodega.classList.contains("sucia")) {
      bodega.classList.remove("sucia");
    }
    bodega.classList.remove("libre-limpiar");
    bodega.classList.add("limpia");
    bodega.innerText = "Limpia";
    bateria -= 10;

    if (!bodegasContadas.has(bodega)) {
      bodegasContadas.add(bodega);
      actualizarBodegasLimpias();

      if (bodegasContadas.size % 4 === 0) {
        cambiarEstadoBodegasLimpias();
      }
    }

    actualizarEstadoBateria();
    statusDiv.innerText = `Aspiradora: Limpiando Bodega ${bodega.textContent}`;
  }
}

async function ejecutarSimulacion() {
  for (const key in bodegas) {
    const bodegaArray = bodegas[key];
    for (let i = 0; i < bodegaArray.length; i++) {
      const bodega = bodegaArray[i];
      const estadoBodega = bodega.className.split(" ")[1];

      aspiradora.style.transform = `translate(${bodega.setTop}px, ${bodega.setLeft}px)`;
      await sleep(2000);

      if (bateria <= 0.5 && estadoBodega !== "limpia") {
        estadoAspiradora = "inactiva";
        await cargarBateriaBaja();
        estadoAspiradora = "limpiando";
      }

      if (estadoBodega !== "limpia") {
        statusDiv.innerText = `Aspiradora: Limpiando Bodega ${bodega.textContent}`;
      }

      switch (estadoBodega) {
        case "libre-limpiar":
        case "sucia":
          if (bateria > 0.5) {
            await limpiarBodega(bodega);
          }
          break;
        case "ocupada":
          statusDiv.innerText = `Aspiradora: Bodega Ocupada - Continuando con otra bodega`;
          setTimeout(() => {
            bodega.classList.remove("ocupada");
            bodega.classList.add("libre-limpiar");
            bodega.innerText = "Libre para limpiar";
          }, 3000);
          break;
        case "limpia":
          statusDiv.innerText = `Aspiradora: Esta Bodega se encuentra limpia`;
          break;
      }
    }
  }

  if (bateria > 0) {
    aspiradora.style.transform = "translate(500, 600)";
    statusDiv.innerText = "Aspiradora: En la base de carga";
    await cargarBateria();
    await sleep(2000);
  }
}

estadosInicialesAleatorios();
ejecutarSimulacion();
