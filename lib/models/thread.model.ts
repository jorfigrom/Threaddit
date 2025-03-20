import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  imageThread: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId, // Thread original y los thread hijos son las respuestas
      ref: "Thread",
    },
  ],
  location: {
    latitude: { type: Number }, // Latitud de la ubicación
    longitude: { type: Number }, // Longitud de la ubicación
    placeName: { type: String }, // Nombre del lugar (opcional)
    address: { type: String }, // Dirección del lugar (opcional)
  },
  likes: [
    {
      type: String, // Cambia de `mongoose.Schema.Types.ObjectId` a `String`
    },
  ],
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;

