document.addEventListener("DOMContentLoaded", () => {
    const unknownList = document.getElementById('unknown-list');
    const unknownFaces = JSON.parse(localStorage.getItem('unknownFaces') || '[]');

    if (unknownFaces.length === 0) {
        unknownList.innerHTML = '<p>No hay rostros desconocidos registrados.</p>';
    } else {
        unknownFaces.forEach((face, index) => {
            const img = document.createElement('img');
            img.src = face.image;
            img.width = 150;
            img.alt = `Desconocido ${index + 1}`;
            unknownList.appendChild(img);
        });
    }
});
