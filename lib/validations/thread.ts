import * as z from 'zod';

export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 'Mínimo 3 caracteres' }),
    accountId: z.string(),
    imageThread:  z.string().url().nonempty(),
    location: z.object({
        latitude: z.number({ required_error: 'La latitud es obligatoria' }),
        longitude: z.number({ required_error: 'La longitud es obligatoria' }),
        placeName: z.string().optional(), // Opcional
        address: z.string().optional(), // Opcional
    }),
});

export const CommentValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 'Mínimo 3 caracteres' }),
});