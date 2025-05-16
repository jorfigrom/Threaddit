"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { createCommunity } from "@/lib/actions/community.actions";
import { communityValidation } from "@/lib/validations/community";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { countUserCommunities } from "@/lib/actions/community.actions";


interface CreateCommunityFormProps {
    userId: string;
}

const CreateCommunityForm = ({ userId }: CreateCommunityFormProps) => {
    const router = useRouter();


    const form = useForm<z.infer<typeof communityValidation>>({
        resolver: zodResolver(communityValidation),
        defaultValues: {
            name: "",
            username: "",
            image: "",
            bio: "",
        },
    });

    //El identificador de la comunidad se genera a partir del id del usuario y el número de comunidades que tiene

    const onSubmit = async (values: z.infer<typeof communityValidation>) => {
        try {
            // Obtener el número de comunidades del usuario
            const count = await countUserCommunities(userId);

            // Generar el ID dinámico
            const generatedId = count > 0 ? `${userId}-${count + 1}` : userId;

            // Crear la comunidad con el ID generado
            await createCommunity(
                generatedId,
                values.name,
                values.username,
                values.image,
                values.bio,
                userId
            );

            router.push("/communities");
        } catch (error: any) {
            form.setError("root", { message: error.message || "Error al crear la comunidad." });
        }
    };

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <h2 className="text-xl font-semibold">Crear Comunidad</h2>

                {form.formState.errors.root && (
                    <p className="text-red-500">{form.formState.errors.root.message}</p>
                )}

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="account-form_input no-focus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Identificador</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="account-form_input no-focus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-4">
                    <FormLabel>Imagen</FormLabel>
                    {form.watch("image") && (
                        <Image
                            src={form.watch("image")}
                            alt="profile preview"
                            width={120}
                            height={120}
                            className="rounded-full object-cover border border-gray-300"
                        />
                    )}
                    <UploadButton<OurFileRouter, "imageUploader">
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            console.log("Files: ", res);
                            form.setValue("image", res[0].url);
                        }}
                        onUploadError={(error: Error) => {
                            alert(`ERROR! ${error.message}`);
                        }}
                        className="text-white py-2 px-4 rounded cursor-pointer"
                    />
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={10}
                                    className="account-form_input no-focus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="bg-[#3763be]">
                    Crear Comunidad
                </Button>
            </form>
        </Form>
    );
};

export default CreateCommunityForm;