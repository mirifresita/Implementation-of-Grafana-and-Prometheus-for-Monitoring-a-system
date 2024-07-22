document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('note-form');
    const notesContainer = document.getElementById('notes-container');

    // Función para agregar una nota al DOM
    const addNoteToDOM = (note) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <h2>${note.title}</h2>
            <p>${note.content}</p>
        `;
        notesContainer.appendChild(noteElement);
    };

    // Función para cargar notas desde el servidor
    const loadNotes = async () => {
        try {
            const response = await fetch('/notes');
            if (response.ok) {
                const notes = await response.json();
                notesContainer.innerHTML = ''; // Limpiar contenido previo
                notes.forEach(addNoteToDOM);
            } else {
                console.error('Failed to fetch notes:', response.status);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    };

    // Manejar el envío del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        try {
            const response = await fetch('/add-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
                form.reset(); // Limpiar el formulario
                loadNotes(); // Recargar las notas
            } else {
                console.error('Failed to add note:', response.status);
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    });

    // Cargar notas al inicio
    loadNotes();
});
