"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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

import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";

import { ThreadValidation } from "@/lib/validations/thread";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createThread } from "@/lib/actions/thread.actions";
import { fetchAllCommunities, fetchUserCommunities } from "@/lib/actions/community.actions"; // Importar la nueva función
import { z } from "zod";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";



import MapboxMap from "@/components/map/MapboxPost";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}

function PostThread({ userId }: { userId: string }) {
    const router = useRouter();
    const pathname = usePathname();

    const [communities, setCommunities] = useState<{ id: string; name: string; username: string }[]>([]);

    // Cargar comunidades al montar el componente
    useEffect(() => {
    async function loadCommunities() {
        try {
            const userCommunities = await fetchUserCommunities(userId); // Obtener comunidades filtradas
            setCommunities(userCommunities);
        } catch (error) {
            console.error("Error loading communities:", error);
        }
    }
    loadCommunities();
}, [userId]);

    const form = useForm({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            accountId: userId,
            imageThread: "",
            communityId: "", // Agregar communityId al formulario
            location: {
                latitude: 0,
                longitude: 0,
                placeName: "",
                address: "",
            },
        },
    });

    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        await createThread({
            text: values.thread,
            author: userId,
            communityId: values.communityId, // Incluir communityId en la creación del thread
            imageThread: values.imageThread,
            location: values.location,
            path: pathname,
            likes: [],
        });

        router.push("/");
    };

    const handleLocationChange = (location: {
        latitude: number;
        longitude: number;
        placeName?: string;
        address?: string;
    }) => {
        form.setValue("location", {
            ...location,
            placeName: location.placeName || "",
            address: location.address || "",
        });
    };

    return (
        <Form {...form}>
            <form
                className="mt-10 flex flex-col justify-start gap-10"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {/* Campo para seleccionar la comunidad */}
                <FormField
                    control={form.control}
                    name="communityId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base-semibold text-light-2">Comunidad</FormLabel>
                            <FormControl>
                                <select
                                    {...field}
                                    className="border border-dark-4 bg-dark-3 text-light-1 p-2 rounded"
                                >
                                    <option value="">Selecciona una comunidad</option>
                                    {communities.map((community) => (
                                        <option key={community.id} value={community.id}>
                                            {community.name} ({community.username})
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo para subir una imagen */}
                <FormField
                    control={form.control}
                    name="imageThread"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base-semibold text-light-2">Imagen</FormLabel>
                            <div className="flex items-center gap-6">
                                <div className="relative w-[150px] h-[150px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                    {!form.watch("imageThread") && (
                                        <span className="absolute text-gray-500 text-center px-2">
                                            Inserta una imagen
                                        </span>
                                    )}
                                    {form.watch("imageThread") && (
                                        <Image
                                            src={form.watch("imageThread")}
                                            alt="Imagen seleccionada"
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <UploadButton<OurFileRouter, "imageUploader">
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        form.setValue("imageThread", res[0].url);
                                    }}
                                    onUploadError={(error: Error) => {
                                        alert(`ERROR! ${error.message}`);
                                    }}
                                />
                            </div>
                        </FormItem>
                    )}
                />

                {/* Campo para la ubicación */}
                <FormField
                    control={form.control}
                    name="location"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base-semibold text-light-2">Ubicación</FormLabel>
                            <MapboxMap onLocationChange={handleLocationChange} />
                            {/* Mostrar los datos de la ubicación seleccionada */}
                            {form.watch("location") && (
                                <div className="mt-4 text-light-1">

                                    <p><strong>Nombre del lugar:</strong> {form.watch("location").placeName}</p>
                                    <p><strong>Dirección:</strong> {form.watch("location").address}</p>
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo para el contenido del thread */}
                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-3">
                            <FormLabel className="text-base-semibold text-light-2">Contenido</FormLabel>
                            <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                                <Textarea rows={12} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="bg-[#3763be]">
                    Publicar thread
                </Button>
            </form>
        </Form>
    );
}

export default PostThread;