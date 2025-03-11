import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Inicio de Sesión</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Olvidaste tu contraseña?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full"
        >
          Ingresar
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            O continua con
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 256 262"
          >
            <path
              fill="#4285F4"
              d="M255.76 131.68c0-7.11-.57-13.85-1.62-20.14H130.3v38.16h70.51c-2.89 15.52-11.31 28.63-24.05 37.43v30.98h38.84c22.6-20.72 35.58-51.28 35.58-86.43z"
            />
            <path
              fill="#34A853"
              d="M130.3 261.09c32.4 0 59.52-10.73 79.36-29.08l-38.84-30.98c-10.51 7.06-24.02 11.2-40.52 11.2-30.99 0-57.27-20.92-66.68-49.24H23.24v31.08c19.8 39.19 60.33 66.02 107.06 66.02z"
            />
            <path
              fill="#FBBC05"
              d="M63.62 162.99c-3.06-9.18-4.81-18.94-4.81-28.98s1.75-19.8 4.81-28.98V73.95H23.24c-8.88 17.64-13.93 37.64-13.93 59.06s5.05 41.42 13.93 59.06l40.38-29.08z"
            />
            <path
              fill="#EA4335"
              d="M130.3 52.03c17.63 0 33.47 6.08 45.94 17.99l34.46-34.46C190.19 17.04 162.69 5.15 130.3 5.15 83.57 5.15 43.04 31.98 23.24 71.16l40.38 31.06c9.41-28.33 35.69-49.24 66.68-49.24z"
            />
          </svg>
          Iniciar sesión con Google
        </Button>
      </div>
      <div className="text-center text-sm">
        No tienes una cuenta?{" "}
        <a
          href="#"
          className="underline underline-offset-4"
        >
          Registrate
        </a>
      </div>
    </form>
  );
}
