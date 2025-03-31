"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";

import { communityValidation } from "@/lib/validations/community";
import { updateCommunityInfo } from "@/lib/actions/community.actions";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface Props {
    community: {
      id: string;
      name: string;
      username: string;
      bio: string;
      image: string;
    };
    btnTitle: string;
  }

const CommunityProfileForm = ({ community, btnTitle }: Props) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof communityValidation>>({
    resolver: zodResolver(communityValidation),
    defaultValues: {
      image: community?.image || "",
      name: community?.name || "",
      username: community?.username || "",
      bio: community?.bio || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof communityValidation>) => {
    console.log("onSubmit triggered with values:", values); // Depuración
    try {
      // Verificar si la imagen ha cambiado
      const blob = values.image;
      const hasImageChanged = isBase64Image(blob);

      if (hasImageChanged) {
        const imgRes = await startUpload(files);

        if (imgRes && imgRes[0]?.url) {
          values.image = imgRes[0].url;
        }
      }

      // Actualizar la información de la comunidad
      await updateCommunityInfo(
        community.id, // Usar el ID directamente desde las props
        values.name,
        values.username,
        values.image,
        values.bio,
      );

      console.log("Community updated successfully");

      // Redirigir a la página de la comunidad actualizada
      router.push(`/communities/${values.username}`);
    } catch (error) {
      console.error("Error updating community:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Validation errors:", errors); // Depuración de errores de validación
        })}
      >
        <div className="flex items-center gap-4">
          {/* Vista previa de la imagen */}
          {form.watch("image") && (
            <Image
              src={form.watch("image")}
              alt="community preview"
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          )}
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              console.log("Files uploaded:", res);
              if (res && res[0]?.url) {
                form.setValue("image", res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error.message);
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Nombre
              </FormLabel>
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
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Usuario
              </FormLabel>
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
          name="bio"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Biografía
              </FormLabel>
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
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default CommunityProfileForm;