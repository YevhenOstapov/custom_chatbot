import React, { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import CustomAlert from "@/components/ui/custom-alert";

import Link from "next/link";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const FormSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordConfirm: z.string().min(8, "Password must be at least 8 characters"),
});

const ResetPassword = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });
  const supabaseClient = createBrowserSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    if (values.password !== values.passwordConfirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    // @ts-ignore
    const { error } = await supabaseClient.auth.updatePasswordFromReset({
      password: values.password,
      access_token: router.query.access_token,
    });
    setLoading(false);

    if (error) {
      setLoading(false);
      setError("Error resetting password");
    } else {
      setLoading(false);
      setSuccess("Your password has been successfully updated");
    }
  }

  return (
    <section className="flex h-screen w-full flex-row items-start justify-center overflow-hidden p-0">
      <section className="flex  h-full w-full flex-1 flex-col items-center justify-center p-6">
        <div className="flex h-full  w-full flex-col justify-center ">
          <div className="w-full">
            <Image
              src={
                theme === "light"
                  ? "/images/logo_noodle.svg"
                  : "/images/logo_noodle_dark.svg"
              }
              alt={"Noodle Logo"}
              width="24"
              height="29"
            />
          </div>
          <div className="flex h-full w-full flex-col items-center justify-center">
            {user == null ? (
              <>
                <div className="flex w-[380px] flex-col items-center gap-14">
                  <div className="w-full">
                    <h1 className="text-4xl font-extrabold dark:text-gray-50 ">
                      Reset Password
                    </h1>
                    <hr className="mt-2" />
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="mb-5 mt-6 flex w-full flex-col items-center gap-4"
                    >
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="text-md  dark:text-gray-50">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="!dark:border-gray-100"
                                placeholder="Password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="text-md dark:text-gray-50">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm Password"
                                {...field}
                                className="!dark:border-gray-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex w-full flex-col items-center justify-between pt-5">
                        <Button
                          type="submit"
                          className="mb-[30px] w-full dark:bg-purple-500 dark:text-gray-50"
                        >
                          {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Reset Password
                        </Button>
                      </div>
                    </form>
                  </Form>
                  {error != null && (
                    <CustomAlert.ErrorAlert text={error} className="mb-8" />
                  )}
                  {success != null && (
                    <CustomAlert.SuccessAlert text={success} className="mb-8" />
                  )}
                </div>
              </>
            ) : (
              <>
                <div>You are logged in</div>
                <Link href="/dashboard">
                  <Button variant="outline">Go to app</Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex flex-col items-center">
            <p className="w-[70%] text-center text-xs text-gray-400 dark:text-white-600">
              By continuing, you agree to the Noodle{" "}
              <Link href="#">Terms of Service and Privacy Policy</Link>, and to
              receive periodic emails with updates.
            </p>
          </div>
        </div>
      </section>

      <section className="gradient-bg hidden h-full flex-1 flex-col items-center justify-center p-20 lg:flex ">
        <div className="w-[90%]">
          <h2 className="text-4xl font-extrabold text-gray-300 ">
            To know thyself is the beginning of wisdom.
          </h2>
          <h2 className="mt-5 text-2xl font-extrabold text-gray-300">
            &mdash; Aristotle
          </h2>
        </div>
      </section>
    </section>
  );
};

export default ResetPassword;
