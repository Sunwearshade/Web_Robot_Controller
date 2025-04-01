const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const nameInput = document.getElementById('name');

Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/public/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/public/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/public/models')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error("Error al acceder a la cámara:", err));
}

captureButton.addEventListener('click', async () => {
    if (!nameInput.value.trim()) {
        alert('Por favor, ingresa un nombre.');
        return;
    }

    const detections = await faceapi.detectSingleFace(video)
        .withFaceLandmarks().withFaceDescriptor();

    if (!detections) {
        alert('No se detectó ningún rostro.');
        return;
    }

    const savedFaces = JSON.parse(localStorage.getItem('registeredFaces') || '[]');
    savedFaces.push({ name: nameInput.value, descriptor: detections.descriptor });
    localStorage.setItem('registeredFaces', JSON.stringify(savedFaces));

    alert(`Rostro de ${nameInput.value} registrado con éxito.`);
});
