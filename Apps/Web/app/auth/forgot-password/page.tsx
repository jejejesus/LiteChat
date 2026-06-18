"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/UI/Button";
import Card, { CardBody, CardHeader } from "@/components/UI/Card";
import Form, { FormField, TextBox } from "@/components/UI/Form";
import LinkButton from "@/components/UI/LinkButton";
import Image from "next/image";

import LiteChatLogoH from "@/public/LiteChat-Logo-H.png";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar solicitud");
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
            Recuperar contraseña
          </h3>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-zinc-600">
                Se ha enviado un enlace de recuperación a <strong>{email}</strong>
              </p>
              <LinkButton href="/auth/login" text="Volver a inicio de sesión" />
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormField label="Email">
                <TextBox
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={setEmail}
                  required
                />
              </FormField>

              {error && (
                <p className="text-sm text-accent font-medium">{error}</p>
              )}

              <Button
                type="submit"
                text="Enviar enlace de recuperación"
                isLoading={isSubmitting}
              />
              <LinkButton href="/auth/login" text="Volver a inicio de sesión" />
            </Form>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
