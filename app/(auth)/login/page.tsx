import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex content-center justify-center gap-2 md:justify-start">
          <div className="mx-auto w-[40%] rounded-full md:w-[18%]">
            <a href="#" className="font-medium">
              <div className="flex items-center justify-center rounded-md text-primary-foreground">
                <img src="/imagenes/logo.png" alt="" />
              </div>
            </a>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/imagenes/portada-login.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
