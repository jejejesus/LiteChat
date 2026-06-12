"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/UI/Button";
import LinkButton from "@/components/UI/LinkButton";
import Card, { CardBody, CardFooter, CardHeader } from "@/components/UI/Card";
import Form, { FormField, TextBox } from "@/components/UI/Form";
import Image from "next/image";

import LiteChatLogoH from "@/public/LiteChat-Logo-H.png";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen gap-8 px-6 py-10 mx-auto">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center mr-4">
          <Image src={LiteChatLogoH} height={55} alt="LiteChat Logo" />
        </CardHeader>
        <CardBody>
          <h3 className="text-2xl font-semibold w-full text-center">
            Iniciar sesión
          </h3>
          <Form onSubmit={handleSubmit}>
            <FormField label="Email" error={error ? "" : undefined}>
              <TextBox
                type="email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
                required
              />
            </FormField>
            <FormField label="Contraseña">
              <TextBox
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={setPassword}
                required
              />
            </FormField>

            {error && (
              <p className="text-sm text-accent font-medium">{error}</p>
            )}

            <Button
              type="submit"
              text="Iniciar Sesión"
              isLoading={isSubmitting}
            />
            <LinkButton
              href="/auth/forgot-password"
              text="¿Olvidaste tu contraseña?"
            />
          </Form>
        </CardBody>
        <CardFooter>
          <span>¿No tienes una cuenta? </span>
          <LinkButton href="/auth/register" text="Registrate" />
        </CardFooter>
      </Card>
    </main>
  );
}
