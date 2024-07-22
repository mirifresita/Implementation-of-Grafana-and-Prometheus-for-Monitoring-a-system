const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const client = require('prom-client');

const app = express();
const port = 5000; // Cambié el puerto a 5000 para evitar conflicto

// Configuración de la base de datos SQLite
const dbPath = path.join(__dirname, 'notes_db.sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conectado a la base de datos SQLite');
});

// Crear tabla si no existe
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL
    )`);
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Exponer métricas de Prometheus
const register = new client.Registry();
const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});
register.registerMetric(httpRequestsTotal);

app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestsTotal.inc({
            method: req.method,
            route: req.path,
            code: res.statusCode
        });
    });
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Ruta para agregar una nota
app.post('/add-note', (req, res) => {
    const { title, content } = req.body;
    const query = 'INSERT INTO notes (title, content) VALUES (?, ?)';

    db.run(query, [title, content], function(err) {
        if (err) {
            console.error('Error al agregar la nota:', err.message);
            return res.status(500).json({ message: 'Error al agregar la nota' });
        }
        res.json({ message: 'Nota agregada exitosamente', id: this.lastID });
    });
});

// Ruta para obtener las notas
app.get('/notes', (req, res) => {
    const query = 'SELECT * FROM notes';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener las notas:', err.message);
            return res.status(500).json({ message: 'Error al obtener las notas' });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

