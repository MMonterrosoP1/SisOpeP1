"use client";

import { useState } from "react";
import { Button, Input, Form, Card, TextField, Label, InputGroup, FieldError } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff, Building2 } from "lucide-react";
import NextImage from "next/image";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Error al iniciar sesión");
        return;
      }

      toast.success("¡Inicio de sesión exitoso!");
      // Next.js middleware or route changes will handle redirect
      window.location.href = "/";
    } catch (err) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Ingresa tu correo para restablecer la contraseña");
      return;
    }
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    if (error) {
      toast.error(error.message || "Error al solicitar restablecimiento");
    } else {
      toast.success("Revisa tu correo para restablecer tu contraseña");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado izquierdo: Formulario */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 text-primary">
            <Building2 size={40} />
            <h1 className="text-3xl font-bold tracking-tight">FM-PREMED</h1>
          </div>

          <Card className="w-full p-2 shadow-sm border border-default-200">
            <Card.Header className="flex-col items-start px-6 pt-6 pb-2">
              <Card.Title className="text-2xl font-semibold">Bienvenido de nuevo</Card.Title>
              <Card.Description className="text-sm text-default-500">Ingresa tus credenciales para acceder al sistema.</Card.Description>
            </Card.Header>
            <Card.Content className="px-6 py-4">
              <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField name="email" type="email" isRequired>
                  <Label>Correo Electrónico</Label>
                  <Input
                    placeholder="ejemplo@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FieldError />
                </TextField>

                <div className="flex w-full flex-col gap-1">
                  <TextField name="password" type={isVisible ? "text" : "password"} isRequired>
                    <Label>Contraseña</Label>
                    <InputGroup>
                      <InputGroup.Input
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <InputGroup.Suffix>
                        <button className="focus:outline-none flex items-center pr-2" type="button" onClick={toggleVisibility}>
                          {isVisible ? (
                            <EyeOff className="text-2xl text-default-400" />
                          ) : (
                            <Eye className="text-2xl text-default-400" />
                          )}
                        </button>
                      </InputGroup.Suffix>
                    </InputGroup>
                    <FieldError />
                  </TextField>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0"
                      onPress={handleForgotPassword}
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full font-medium"
                  isDisabled={loading}
                >
                  Iniciar Sesión
                </Button>
              </Form>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Lado derecho: Imagen de Clínica (Carousel / Hero) */}
      <div className="hidden lg:flex w-1/2 relative bg-default-100 items-center justify-center overflow-hidden">
        <NextImage
          src="/clinic-hero.png"
          alt="Clínica Médica"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h2 className="text-4xl font-bold mb-4">Atención Médica </h2>
          <p className="text-lg text-white/90">
          </p>
        </div>
      </div>
    </div>
  );
}
