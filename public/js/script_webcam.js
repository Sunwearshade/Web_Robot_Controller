const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const MODEL_URL = '/public/models';

// 📌 Cargar modelos antes de detectar
async function loadModels() {
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("✅ Modelos cargados correctamente");
        startCamera();
    } catch (error) {
        console.error("❌ Error al cargar los modelos:", error);
    }
}

// 📌 Almacenar los descriptores de los rostros registrados
let registeredDescriptors = [];

// 📌 Función para cargar los descriptores de los rostros registrados
const loadStoredDescriptors = () => {
    const existingDescriptors = JSON.parse(localStorage.getItem('faceDescriptors')) || [];
    return existingDescriptors.map(item => ({
        name: item.name,
        descriptors: item.descriptors.map(descriptor => new Float32Array(descriptor))
    }));
};

// 📌 Función para registrar un usuario
const registerUser = (userName, descriptors) => {
    let existingDescriptors = JSON.parse(localStorage.getItem('faceDescriptors')) || [];
    existingDescriptors.push({ name: userName, descriptors: descriptors });
    localStorage.setItem('faceDescriptors', JSON.stringify(existingDescriptors));
    console.log(`Usuario registrado: ${userName}`);
};

// 📌 Acceder a la cámara
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            console.log("📸 Cámara activada");
            detectFaces();
        };
    } catch (err) {
        console.error("❌ Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara.");
    }
}

// 📌 Detección de caras en tiempo real
async function detectFaces() {
    console.log("🔍 Iniciando detección de rostros...");
    
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceDescriptors();

        // Limpiar el canvas antes de dibujar
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);

        // 📌 Comparar los rostros detectados con los descriptores registrados
        const labeledDescriptors = loadStoredDescriptors();
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

        detections.forEach(detection => {
            const result = faceMatcher.findBestMatch(detection.descriptor);
            const { label, distance } = result;

            if (distance < 0.6) {
                // Rostro reconocido: dibujar un recuadro verde con el nombre
                const box = detection.detection.box;
                new faceapi.draw.DrawBox(box, { label: label }).draw(canvas);
                console.log(`Rostro reconocido como: ${label}`);
            } else {
                // Rostro desconocido: dibujar un recuadro rojo
                const box = detection.detection.box;
                new faceapi.draw.DrawBox(box, { label: 'Desconocido' }).draw(canvas);
                console.log('Rostro desconocido');
            }
        });
    }, 100);
}

// 📌 Iniciar la carga de modelos
loadModels();
