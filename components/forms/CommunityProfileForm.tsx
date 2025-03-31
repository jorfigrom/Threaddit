"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  community?: {
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
      image: "",
      name: "",
      username: "",
      bio: "",
    },
  });

  // Actualiza los valores del formulario cuando 'community' esté disponible
  useEffect(() => {
    if (community) {
      form.reset({
        image: community.image || "",
        name: community.name || "",
        username: community.username || "",
        bio: community.bio || "",
      });
    }
  }, [community, form]);

  const onSubmit = async (values: z.infer<typeof communityValidation>) => {
    console.log("onSubmit triggered with values:", values);
    try {
      const blob = values.image;
      const hasImageChanged = isBase64Image(blob);

      if (hasImageChanged) {
        const imgRes = await startUpload(files);
        if (imgRes && imgRes[0]?.url) {
          values.image = imgRes[0].url;
        }
      }

      await updateCommunityInfo({
        communityId: community?.id || "", // Asegurar que el ID esté presente
        name: values.name,
        username: values.username,
        image: values.image,
        bio: values.bio,
        path: `/communities/${values.username}/edit`,
      });

      console.log("Community updated successfully");
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
          console.log("Validation errors:", errors);
        })}
      >
        <div className="flex items-center gap-4">
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

        {["name", "username", "bio"].map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName as "name" | "username" | "bio"}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="text-base-semibold text-light-2">
                  {fieldName === "name"
                    ? "Nombre"
                    : fieldName === "username"
                    ? "Usuario"
                    : "Biografía"}
                </FormLabel>
                <FormControl>
                  {fieldName === "bio" ? (
                    <Textarea rows={10} className="account-form_input no-focus" {...field} />
                  ) : (
                    <Input type="text" className="account-form_input no-focus" {...field} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" className="bg-[#3763be]">
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default CommunityProfileForm;
