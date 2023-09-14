import React, { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomAlert from "@/components/ui/custom-alert";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

const FormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const Login = () => {
  const supabaseClient = createBrowserSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [islogin, setIslogin] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  //
  // TODO: fix this so that we're not storing session data in state
  //
  useEffect(() => {
    if (user || sessionData != null) {
      router.push("/dashboard");
    }
  }, [user, router]);

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    if (islogin) {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      setSessionData(data);
      setLoading(false);
      // if (data.session != null) {
      //   router.push("/dashboard");
      // } else {
      //   setError(
      //     "Please check if you have verified your email and that your password is correct."
      //   );
      // }
      console.log(data);
    } else {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: "/dashboard",
        },
      });

      setLoading(false);

      if (error) {
        setError(error?.message);
      } else {
        setSuccess("Please check your email to verify your account.");
      }
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
                    {islogin ? (
                      <>
                        <h1 className="text-4xl font-extrabold dark:text-gray-50 ">
                          Log in to Noodle
                        </h1>
                        <hr className="mt-2" />
                      </>
                    ) : (
                      <>
                        <h1 className="text-4xl font-extrabold">Sign Up</h1>
                        <hr className="mt-2" />
                      </>
                    )}
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="mb-5 mt-6 flex w-full flex-col items-center gap-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="text-md  dark:text-gray-50">
                              Email address
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="!dark:border-gray-100"
                                placeholder="Enter Email...."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="text-md dark:text-gray-50">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="**********"
                                {...field}
                                className="!dark:border-gray-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex w-full flex-col items-center justify-between pt-5">
                        {islogin ? (
                          <>
                            <Button
                              type="submit"
                              className="mb-[30px] w-full dark:bg-purple-500 dark:text-gray-50"
                            >
                              {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Sign In
                            </Button>
                            <div className="flex cursor-pointer text-sm dark:text-gray-400">
                              <p className="text-gray-700 dark:text-gray-500">
                                Don&apos;t have an account?{" "}
                              </p>{" "}
                              <p
                                className="pl-2.5"
                                onClick={() =>
                                  setIslogin((prevCheck) => !prevCheck)
                                }
                              >
                                {" "}
                                Sign up here.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Button
                              type="submit"
                              className="mb-[30px] w-full dark:bg-purple-500 dark:text-gray-50"
                            >
                              {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Create Account
                            </Button>
                            <div className="flex cursor-pointer text-sm ">
                              <p className="text-gray-700">
                                Already registered?
                              </p>{" "}
                              <p
                                className="pl-2.5"
                                onClick={() =>
                                  setIslogin((prevCheck) => !prevCheck)
                                }
                              >
                                {" "}
                                Sign in here.
                              </p>
                            </div>
                          </>
                        )}
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

export default Login;
