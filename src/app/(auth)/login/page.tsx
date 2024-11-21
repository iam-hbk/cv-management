import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container m-auto flex h-screen w-screen flex-row items-center justify-center">
      <Image
        priority
        src="/logo.png"
        alt="Logo"
        width={200}
        height={200}
        className="h-auto w-auto duration-500 animate-in slide-in-from-left"
      />
      <Separator orientation="vertical" className="mx-4 h-[50vh]" />
      <Card className="w-[380px] shadow-none duration-500 animate-in slide-in-from-right">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex w-full flex-row justify-between gap-2">
            <div className="flex flex-col gap-2">
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to sign in
              </CardDescription>
            </div>
            <Link
              href="/"
              className="flex flex-row text-nowrap text-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
