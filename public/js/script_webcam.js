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
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log("✅ Modelos cargados correctamente");
        startCamera();
    } catch (error) {
        console.error("❌ Error al cargar los modelos:", error);
    }
}

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
            .withFaceExpressions();

        // Limpiar el canvas antes de dibujar
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);
        faceapi.draw.drawFaceExpressions(canvas, detections, 0.05);

        // 📌 Detectar si la persona está sonriendo
        if (detections.length > 0) {
            const expressions = detections[0].expressions;
            const smileProbability = expressions.happy;

            // Mostrar mensaje de sonrisa
            if (smileProbability > 0.5) {
                console.log(" Estás sonriendoooo");
            } else {
                console.log("No estás sonriendo");
            }
        }
    }, 100);
}

// 📌 Iniciar la carga de modelos
loadModels();
