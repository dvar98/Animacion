const graphData = {
    nodes: [
        { id: 0, name: "Base de Carga", state: "pending", x: 10, y: 100 },
        { id: 1, name: "Aspiradora", state: "pending", x: 10, y: 100 },
        { id: 2, name: "Contenedor 1", state: "in_progress", x: 400, y: 300 },
        { id: 3, name: "Contenedor 2", state: "pending", x: 449, y: 64 },
        { id: 4, name: "Contenedor 3", state: "pending", x: 622, y: 405 },
        { id: 5, name: "Contenedor 4", state: "pending", x: 204, y: 499 },
    ],
    links: [
    ]
};

const width = 800;
const height = 600;

const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const simulation = d3.forceSimulation(graphData.nodes)
    .force("link", d3.forceLink(graphData.links).distance(100))
    .force("collide", d3.forceCollide().radius(12).strength(0));

const links = svg.selectAll("line")
    .data(graphData.links)
    .enter().append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1);

const nodes = svg.selectAll("circle")
    .data(graphData.nodes)
    .enter().append("circle")
    .attr("r", 10)
    .attr("class", d => d.name === "Aspiradora" ? "aspiradora" : "") // Aplicar la clase "aspiradora" al nodo "Aspiradora"
    .attr("fill", "blue")
    .each(recordInitialPosition);


function generateRandomState() {
    const possibleStates = ["pending", "in_progress", "completed", "delayed"];
    const randomIndex = Math.floor(Math.random() * possibleStates.length);
    return possibleStates[randomIndex];
}

graphData.nodes.forEach(node => {
    node.state = generateRandomState();
});

const nodeLabels = svg.selectAll(".node-label")
    .data(graphData.nodes)
    .enter().append("text")
    .attr("class", "node-label")
    .text(d => `${d.name} - ${d.state}`)
    .attr("dx", 12)
    .attr("dy", 4);

function createFixedPosition(x, y) {
    return function (d) {
        d.x = x;
        d.y = y;
    };
}

function recordInitialPosition(node) {
    console.log(`Posición inicial de ${node.name}: x = ${node.x}, y = ${node.y}`);
}


function getNodePosition(nodeName) {
    const node = graphData.nodes.find(node => node.name === nodeName);
    if (node) {
        console.log(`Posición de ${nodeName}: x = ${node.x}, y = ${node.y}`);
    } else {
        console.log(`Nodo con nombre ${nodeName} no encontrado.`);
    }
}

function createBoundary(width, height) {
    return function (d) {
        d.x = Math.max(10, Math.min(width - 10, d.x));
        d.y = Math.max(10, Math.min(height - 10, d.y));
    };
}

function toggleFixedNode(d) {
    if (d.fx === null || d.fy === null) {
        d.fx = d.x;
        d.fy = d.y;
    } else {
        d.fx = null;
        d.fy = null;
    }
}

function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        toggleFixedNode(d);
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
        console.log(`Posición de ${d.name}: x = ${d.fx}, y = ${d.fy}`);
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

simulation.on("tick", () => {
    links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    nodes
        .each(createBoundary(width, height))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    nodeLabels
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("display", d => {
            if (d.name === "Aspiradora") {
                const otherNode = graphData.nodes.find(node => node.name !== "Aspiradora");
                const distance = Math.sqrt(Math.pow(d.x - otherNode.x, 2) + Math.pow(d.y - otherNode.y, 2));
                return distance < 20 ? "none" : "block"; // Ocultar si la distancia es menor que 20
            }
            return "block";
        });
});

// Función para ocultar las etiquetas (nombre y estado) de la Aspiradora
function hideAspiradoraLabels() {
    const threshold = 15; // Umbral para la superposición

    // Verificar si "Aspiradora" se superpone con otro nodo
    const overlappingNode = graphData.nodes.find(node => {
        return node.id !== aspiradoraNode.id && Math.abs(node.x - aspiradoraNode.x) < threshold && Math.abs(node.y - aspiradoraNode.y) < threshold;
    });

    if (overlappingNode) {
        svg.selectAll("circle")
            .filter(d => d.name === "Aspiradora")
            .attr('opacity', 0);
        svg.selectAll(".node-label")
            .filter(d => d.name === "Aspiradora")
            .attr('opacity', 0); // Hacer invisible el nombre y el estado
    } else {
        svg.selectAll("circle")
            .filter(d => d.name === "Aspiradora")
            .attr('opacity', 1); // Hacer visible el nodo si no se superpone con otro nodo
        svg.selectAll(".node-label")
            .filter(d => d.name === "Aspiradora")
            .attr('opacity', 1); // Hacer visible el nombre y el estado
    }
}

nodes.call(drag(simulation));

// Animar el movimiento de la aspiradora hacia Tarea 2
const tarea2Node = graphData.nodes.find(node => node.name === "Contenedor 1");
let aspiradoraNode = graphData.nodes.find(node => node.name === "Aspiradora");

// Animar el movimiento de la aspiradora hacia Tarea 2
anime({
    targets: aspiradoraNode,
    x: tarea2Node.x,
    y: tarea2Node.y,
    duration: 1000, // Duración de la animación en milisegundos
    easing: 'steps(15)', // Opción de animación de pasos
    update: () => {
        hideAspiradoraLabels(); // Verificar y ocultar etiquetas si es necesario
        simulation.nodes(graphData.nodes); // Actualizar la simulación en cada fotograma durante la animación
    }
});