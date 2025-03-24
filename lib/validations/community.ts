import * as z from "zod";

export const communityValidation = z.object({
    id: z.string(),
    name: z.string().nonempty({ message: "El nombre es obligatorio" }),
    username: z.string().nonempty({ message: "El nombre de usuario es obligatorio" }),
    image: z.string(),
    bio: z.string(),
});