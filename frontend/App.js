// Author: Pxndx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  const API_URL = 'http://localhost:4000/api/tareas';

  const cargarTareas = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTareas(data);
    } catch (error) {
      console.error('Error conectando con el backend:', error);
    } finally {
      setCargando(false);
    }
  };

  // Función para reiniciar todas las tareas a pendiente al llegar medianoche
  const reiniciarTareasDiarias = async () => {
    try {
      await fetch(`${API_URL}/reiniciar`, { method: 'POST' });
      cargarTareas();
    } catch (error) {
      console.error('Error al reiniciar tareas del día:', error);
    }
  };

  const calcularSegundosHastaMedianoche = () => {
    const ahora = new Date();
    const medianoche = new Date();
    medianoche.setHours(24, 0, 0, 0);
    const diferenciaSegundos = Math.floor((medianoche - ahora) / 1000);
    return diferenciaSegundos > 0 ? diferenciaSegundos : 0;
  };

  useEffect(() => {
    cargarTareas();
    setTiempoRestante(calcularSegundosHastaMedianoche());

    const timer = setInterval(() => {
      const segundosRestantes = calcularSegundosHastaMedianoche();
      setTiempoRestante(segundosRestantes);

      // Cuando el reloj marca la medianoche (0 segundos), reinicia el estado de las tareas
      if (segundosRestantes <= 1) {
        reiniciarTareasDiarias();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatearTiempo = (segundos) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const agregarTarea = async () => {
    if (!nuevoTitulo.trim()) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevoTitulo }),
      });
      setNuevoTitulo('');
      cargarTareas();
    } catch (error) {
      console.error('Error agregando tarea:', error);
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    let siguienteEstado = 'Pendiente';
    if (estadoActual === 'Pendiente') siguienteEstado = 'En progreso';
    else if (estadoActual === 'En progreso') siguienteEstado = 'Completado';
    else if (estadoActual === 'Completado') siguienteEstado = 'Pendiente';

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: siguienteEstado }),
      });
      cargarTareas();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const eliminarTarea = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      cargarTareas();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case 'Completado':
        return { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399' };
      case 'En progreso':
        return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Recordatorio Diario</Text>
            <Text style={styles.subtitle}>Las tareas se restablecen al cambiar de día</Text>
          </View>
          <View style={styles.clockBox}>
            <Text style={styles.clockLabel}>Nuevo día en:</Text>
            <Text style={styles.clockText}>{formatearTiempo(tiempoRestante)}</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nueva actividad para hoy..."
            placeholderTextColor="#64748b"
            value={nuevoTitulo}
            onChangeText={setNuevoTitulo}
          />
          <TouchableOpacity style={styles.button} onPress={agregarTarea}>
            <Text style={styles.buttonText}>Añadir</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <ScrollView style={styles.scroll}>
            {tareas.map((item) => {
              const badge = getBadgeStyle(item.estado);
              return (
                <View key={item.id} style={styles.taskItem}>
                  <Text style={styles.taskText}>{item.titulo}</Text>
                  
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => cambiarEstado(item.id, item.estado)}
                      style={[styles.badge, { backgroundColor: badge.bg }]}
                    >
                      <Text style={[styles.badgeText, { color: badge.text }]}>
                        {item.estado}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => eliminarTarea(item.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: '100vh',
  },
  card: {
    width: '100%',
    maxWidth: 650,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  clockBox: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  clockLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  clockText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    outlineStyle: 'none',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scroll: {
    maxHeight: 320,
  },
  taskItem: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    color: '#e2e8f0',
    fontSize: 15,
    flex: 1,
    marginRight: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f87171',
    fontWeight: 'bold',
    fontSize: 12,
  },
});