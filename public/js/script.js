// 📌 Almacenar los descriptores de los rostros registrados
const saveFaceDescriptors = (userName, faceDescriptors) => {
    const existingDescriptors = JSON.parse(localStorage.getItem('faceDescriptors')) || [];
    // Añadir el descriptor junto con el nombre del usuario
    existingDescriptors.push({ name: userName, descriptors: faceDescriptors });
    localStorage.setItem('faceDescriptors', JSON.stringify(existingDescriptors));
    console.log('Rostros registrados exitosamente.');
};

// 📌 Función para cargar los descriptores de los rostros registrados
const loadStoredDescriptors = () => {
    const existingDescriptors = JSON.parse(localStorage.getItem('faceDescriptors')) || [];
    // Mapear los descriptores cargados para crear objetos LabeledFaceDescriptors
    return existingDescriptors.map(item => {
        return new faceapi.LabeledFaceDescriptors(item.name, item.descriptors.map(descriptor => new Float32Array(descriptor)));
    });
};

// 📌 Función para registrar un usuario
const registerUser = (userName, descriptors) => {
    let existingDescriptors = JSON.parse(localStorage.getItem('faceDescriptors')) || [];
    existingDescriptors.push({ name: userName, descriptors: descriptors });
    localStorage.setItem('faceDescriptors', JSON.stringify(existingDescriptors));
    console.log(`Usuario registrado: ${userName}`);
};

// 📌 Detección de caras en tiempo real
async function detectFaces() {
    console.log("🔍 Iniciando detección de rostros...");

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptors();

        // Limpiar el canvas antes de dibujar
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);
        faceapi.draw.drawFaceExpressions(canvas, detections, 0.05);

        // 📌 Comparar los rostros detectados con los descriptores registrados
        const labeledDescriptors = loadStoredDescriptors();
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

        detections.forEach((detection, index) => {
            const result = faceMatcher.findBestMatch(detection.descriptor);

            // Dibuja el cuadro alrededor del rostro y muestra el nombre si lo encuentra
            const box = detection.detection.box;
            const drawOptions = result.distance < 0.6 ? { label: result.label, boxColor: 'green' } : { label: 'Desconocido', boxColor: 'red' };
            const drawBox = new faceapi.draw.DrawBox(box, { label: drawOptions.label, boxColor: drawOptions.boxColor });
            drawBox.draw(canvas);
        });
    }, 100);
}
