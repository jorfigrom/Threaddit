"use client"

import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { zodResolver } from '@hookform/resolvers/zod';
import { userValidation } from '@/lib/validations/user';
import { z } from "zod"

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


    // 1. Define your form.
    const AccountProfile = ({user, btnTitle}: Props) => {

        const form = useForm({
            resolver: zodResolver(userValidation),
            defaultValues: {
                profile_photo: '',
                name: '',
                username: '',
                bio: ''
            }
        });
    
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof userValidation>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return (
        <Form {...form}>
        <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="flex flex-col justify-start gap-10"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    );
}
export default AccountProfile;