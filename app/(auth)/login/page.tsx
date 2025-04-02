import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel Izquierdo: Logo y formulario, alineados al tope */}
      <div className="flex flex-col justify-start gap-4 border border-border p-6 md:p-10">
        {/* Logo */}
        <div className="mt-6 flex items-start gap-2 md:justify-center">
          <div className="w-[40%] md:w-[15%]">
            <a href="#" className="font-medium">
              <div className="flex items-center justify-center rounded-md">
                <img src="/imagenes/logo.png" alt="Logo" />
              </div>
            </a>
          </div>
        </div>
        {/* Formulario */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      {/* Panel Derecho: Imagen de fondo */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/imagenes/portada-login.jpg"
          alt="Fondo de login"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
