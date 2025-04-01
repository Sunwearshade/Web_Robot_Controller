document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.getElementById('gallery');
    const registeredFaces = JSON.parse(localStorage.getItem('registeredFaces') || '[]');

    if (registeredFaces.length === 0) {
        gallery.innerHTML = '<p>No hay rostros registrados.</p>';
    } else {
        registeredFaces.forEach((face, index) => {
            const div = document.createElement('div');
            div.innerHTML = `<p>${face.name}</p>`;
            gallery.appendChild(div);
        });
    }
});
