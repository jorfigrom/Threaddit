import { z } from "zod";

export const ThreadValidation = z.object({
  thread: z.string().min(1, "El contenido del thread es obligatorio."),
  accountId: z.string(),
  imageThread: z.string(),
  communityId: z.string().min(1, "Debes seleccionar una comunidad."), // Agregar communityId
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    placeName: z.string().optional(),
    address: z.string().optional(),
  }),
});
export const CommentValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 'Mínimo 3 caracteres' }),
});