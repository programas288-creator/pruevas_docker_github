-- Author: Pxndx
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tareas (titulo, estado) VALUES
('Configurar entorno Docker en Windows 10', 'Completado'),
('Conectar React Native Web con PostgreSQL', 'En progreso'),
('Subir repositorio completo a GitHub', 'Pendiente');