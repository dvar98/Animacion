document.getElementById('btnIniciar').addEventListener('click', () => {
    const graphData = {
        nodes: [
            { id: 0, name: "Base de Carga", state: "", x: 10, y: 100 },
            { id: 1, name: "Aspiradora", state: null, x: 10, y: 100 },
            { id: 2, name: "Contenedor 1", state: "in_progress", x: 400, y: 300 },
            { id: 3, name: "Contenedor 2", state: "pending", x: 449, y: 64 },
            { id: 4, name: "Contenedor 3", state: "pending", x: 622, y: 405 },
            { id: 5, name: "Contenedor 4", state: "pending", x: 204, y: 499 },
        ],
        links: [
        ]
    };

    const width = 950;
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
        const possibleStates = ["Libre para limpiar", "Ocupada continuar con otra", "Limpia no limpiar", "Sucia limpiar"];
        const randomIndex = Math.floor(Math.random() * possibleStates.length);
        return possibleStates[randomIndex];
    }

    graphData.nodes.forEach(node => {
        if (node.name !== "Base de Carga") {
            node.state = generateRandomState();
        }
    });

    const nodeLabels = svg.selectAll(".node-label")
        .data(graphData.nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .text(d => d.name !== "Base de Carga" ? `${d.name} - ${d.state}` : d.name)
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

    //Arrastrar nodos
    // nodes.call(drag(simulation));

    // Animar el movimiento de la aspiradora hacia Tarea 2
    let aspiradoraNode = graphData.nodes.find(node => node.name === "Aspiradora");
    const contenedores = graphData.nodes.filter(node => node.name.includes("Contenedor"));
    const timeline = anime.timeline({
        easing: 'steps(50)',
        autoplay: false,
    });

    // Función para pausar la animación
    async function pauseAnimation() {
        await new Promise(resolve => timeline.pause());
    }

    // Función para reanudar la animación
    function resumeAnimation() {
        timeline.play();
    }

    // Función para retrasar la animación
    async function delayAnimation(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Función para manejar el contenedor sucio
    async function handleDirtyContainer(contenedor) {
        pauseAnimation();
        console.log(`Limpiando ${contenedor.name}`);
        await delayAnimation(500);
        contenedor.state = "Limpia no limpiar";
        updateNodeLabel(contenedor);
        console.log(`Terminando de limpiar ${contenedor.name}`);
        resumeAnimation();
    }

    // Función para manejar el contenedor libre para limpiar
    async function handleFreeContainer(contenedor) {
        pauseAnimation();
        console.log(`Entrando al contenedor ${contenedor.name}`);
        await delayAnimation(500);
        contenedor.state = "Limpia no limpiar";
        updateNodeLabel(contenedor);
        console.log(`Terminando de limpiar ${contenedor.name}`);
        resumeAnimation();
    }

    // Función para manejar el contenedor ocupado
    function handleOccupiedContainer(contenedor, index, contenedores) {
        console.log(`Evitando entrar al contenedor ocupado ${contenedor.name}`);
        const nextNode = contenedores[index + 1];
        if (nextNode) {
            resumeAnimation();
        }
    }

    // Función para manejar el contenedor limpio
    function handleCleanContainer(contenedor, index, contenedores) {
        console.log(`Evitando entrar al contenedor limpio ${contenedor.name}`);
        const nextNode = contenedores[index + 1];
        if (nextNode) {
            resumeAnimation();
        }
    }

    // Uso de las funciones en el bucle forEach
    contenedores.forEach(async (contenedor, index) => {
        timeline.add({
            targets: aspiradoraNode,
            x: contenedor.x,
            y: contenedor.y,
            duration: 1000,
            update: async (anim) => {
                hideAspiradoraLabels();
                if (contenedor.state === "Sucia limpiar" && aspiradoraNode.x === contenedor.x && aspiradoraNode.y === contenedor.y) {
                    await handleDirtyContainer(contenedor);
                } else if (contenedor.state === "Libre para limpiar" && aspiradoraNode.x === contenedor.x && aspiradoraNode.y === contenedor.y) {
                    await handleFreeContainer(contenedor);
                } else if (contenedor.state === "Ocupada continuar con otra" && aspiradoraNode.x === contenedor.x && aspiradoraNode.y === contenedor.y) {
                    handleOccupiedContainer(contenedor, index, contenedores);
                } else if (contenedor.state === "Limpia no limpiar" && aspiradoraNode.x === contenedor.x && aspiradoraNode.y === contenedor.y) {
                    handleCleanContainer(contenedor, index, contenedores);
                }
            }
        });
    });

    // Añadir animación de retorno al punto de origen
    timeline.add({
        targets: aspiradoraNode,
        x: graphData.nodes[0].x,
        y: graphData.nodes[0].y,
        duration: 2300,
        update: hideAspiradoraLabels, // Vincular la función con el evento de actualización
    });

    // Función para actualizar la etiqueta del nodo
    function updateNodeLabel(node) {
        svg.selectAll(".node-label")
            .filter(d => d.id === node.id)
            .text(d => `${d.name} - ${d.state}`);
    }


    // Iniciar la línea de tiempo
    timeline.play();
});