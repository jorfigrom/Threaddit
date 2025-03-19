"use client";

import Image from "next/image";
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

import { userValidation } from "@/lib/validations/user";
import { ThreadValidation } from "@/lib/validations/thread";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createThread } from "@/lib/actions/thread.actions";
import { z } from "zod";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import MapaInteractivo from "../map/map";

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

    const form = useForm({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            accountId: userId,
            imageThread: "",
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
            communityId: null,
            imageThread: values.imageThread,
            location: values.location,
            path: pathname,
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
                className='mt-10 flex flex-col justify-start gap-10'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name="imageThread"
                    render={() => (
                        <FormItem>
                            {/* Etiqueta para el campo */}
                            <FormLabel className="text-base-semibold text-light-2">Imagen</FormLabel>

                            {/* Contenedor principal: Imagen a la izquierda y botón a la derecha */}
                            <div className="flex items-center gap-6">
                                {/* Contenedor de la imagen con texto superpuesto */}
                                <div className="relative w-[150px] h-[150px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                    {/* Texto de "Inserta una imagen" si no hay imagen */}
                                    {!form.watch("imageThread") && (
                                        <span className="absolute text-gray-500 text-center px-2">
                                            Inserta una imagen
                                        </span>
                                    )}

                                    {/* Imagen cargada */}
                                    {form.watch("imageThread") && (
                                        <Image
                                            src={form.watch("imageThread")}
                                            alt="Imagen seleccionada"
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Botón de subida a la derecha */}
                                <UploadButton<OurFileRouter, "imageUploader">
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        console.log("Files: ", res);
                                        alert("Upload Completed");
                                        form.setValue("imageThread", res[0].url);
                                    }}
                                    onUploadError={(error: Error) => {
                                        alert(`ERROR! ${error.message}`);
                                    }}
                                    onBeforeUploadBegin={(files) =>
                                        files.map(
                                            (f) => new File([f], "renamed-" + f.name, { type: f.type })
                                        )
                                    }
                                    onUploadBegin={(name) => {
                                        console.log("Uploading: ", name);
                                    }}
                                />
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base-semibold text-light-2">Ubicación</FormLabel>
                            <MapaInteractivo onLocationChange={handleLocationChange} />
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <FormField
                    control={form.control}
                    name='thread'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Contenido
                            </FormLabel>
                            <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                                <Textarea
                                    rows={12}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type='submit' className='bg-[#3763be]'>
                    Publicar thread
                </Button>

            </form>
        </Form>
    )
}

export default PostThread;