// Author: Pxndx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [cargando, setCargando] = useState(true);

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

  useEffect(() => {
    cargarTareas();
  }, []);

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

  return (
    <View className="flex-1 bg-slate-900 items-center justify-center p-6 min-h-screen">
      <View className="w-full max-w-xl bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
        <Text className="text-2xl font-bold text-white mb-2">
          Sistema de Prueba Docker + RN
        </Text>
        <Text className="text-slate-400 mb-6 text-sm">
          React Native Web • NativeWind • Node.js • PostgreSQL
        </Text>

        <View className="flex-row gap-2 mb-6">
          <TextInput
            className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700"
            placeholder="Escribe una nueva tarea..."
            placeholderTextColor="#64748b"
            value={nuevoTitulo}
            onChangeText={setNuevoTitulo}
          />
          <TouchableOpacity
            onPress={agregarTarea}
            className="bg-blue-600 px-5 py-3 rounded-xl justify-center items-center active:bg-blue-700"
          >
            <Text className="text-white font-semibold">Agregar</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <ScrollView className="max-h-80">
            {tareas.map((item) => (
              <View
                key={item.id}
                className="bg-slate-900/80 p-4 rounded-xl mb-3 border border-slate-700/50 flex-row justify-between items-center"
              >
                <Text className="text-slate-200 font-medium flex-1 mr-2">
                  {item.titulo}
                </Text>
                <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                  <Text className="text-emerald-400 text-xs font-semibold">
                    {item.estado}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}