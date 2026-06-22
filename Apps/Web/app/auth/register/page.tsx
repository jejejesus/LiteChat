"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/UI/Button";
import Card, { CardBody, CardFooter, CardHeader } from "@/components/UI/Card";
import Form, {
  FormField,
  TextBox,
  DateTimePicker,
  Toggle,
} from "@/components/UI/Form";
import LinkButton from "@/components/UI/LinkButton";
import Image from "next/image";

import LiteChatLogoH from "@/public/LiteChat-Logo-H.png";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    firstSurname: "",
    secondSurname: "",
    surnameFirst: false,
    birthDate: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: string) => (val: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = {
      name: form.name.trim(),
      firstSurname: form.firstSurname.trim(),
      secondSurname: form.secondSurname.trim(),
      birthDate: form.birthDate,
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    if (!trimmed.name) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!trimmed.firstSurname) {
      setError("El primer apellido es obligatorio");
      return;
    }
    if (!trimmed.birthDate) {
      setError("La fecha de nacimiento es obligatoria");
      return;
    }
    if (!trimmed.phoneNumber) {
      setError("El teléfono es obligatorio");
      return;
    }
    if (!/^\d{7,15}$/.test(trimmed.phoneNumber.replace(/\D/g, ""))) {
      setError("El teléfono debe tener entre 7 y 15 dígitos");
      return;
    }
    if (!trimmed.email) {
      setError("El email es obligatorio");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
      setError("El email no tiene un formato válido");
      return;
    }
    if (!trimmed.password) {
      setError("La contraseña es obligatoria");
      return;
    }
    if (trimmed.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (trimmed.password !== trimmed.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email: trimmed.email,
        name: trimmed.name,
        firstSurname: trimmed.firstSurname,
        secondSurname: trimmed.secondSurname || undefined,
        surnameFirst: form.surnameFirst,
        birthDate: trimmed.birthDate,
        phoneNumber: trimmed.phoneNumber,
        password: trimmed.password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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
            Registrarse
          </h3>
          <Form onSubmit={handleSubmit}>
            <FormField label="Nombre(s)" required>
              <TextBox
                placeholder="Nombre"
                value={form.name}
                onChange={update("name")}
                required
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Primer apellido" required>
                <TextBox
                  placeholder="Primer apellido"
                  value={form.firstSurname}
                  onChange={update("firstSurname")}
                  required
                />
              </FormField>
              <FormField label="Segundo apellido">
                <TextBox
                  placeholder="Segundo apellido"
                  value={form.secondSurname}
                  onChange={update("secondSurname")}
                />
              </FormField>
            </div>
            <FormField>
              <Toggle
                label="Apellido(s) primero"
                checked={form.surnameFirst}
                onChange={update("surnameFirst")}
              />
            </FormField>
            <FormField label="Fecha de Nacimiento" required>
              <DateTimePicker
                mode="date"
                placeholder="Seleccionar Fecha"
                value={form.birthDate}
                onChange={update("birthDate")}
              />
            </FormField>
            <FormField label="Teléfono" required>
              <TextBox
                placeholder="Teléfono +52"
                value={form.phoneNumber}
                onChange={update("phoneNumber")}
                required
              />
            </FormField>
            <FormField label="Email" required>
              <TextBox
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={update("email")}
                required
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Contraseña" required>
                <TextBox
                  type="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={update("password")}
                  required
                />
              </FormField>
              <FormField label="Confirmar Contraseña" required>
                <TextBox
                  type="password"
                  placeholder="Confirmar Contraseña"
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  required
                />
              </FormField>
            </div>

            {error && (
              <p className="text-sm text-accent font-medium">{error}</p>
            )}

            <Button type="submit" text="Registrarse" isLoading={isSubmitting} />
          </Form>
        </CardBody>
        <CardFooter>
          <span>¿Ya tienes una cuenta? </span>
          <LinkButton href="/auth/login" text="Iniciar Sesión" />
        </CardFooter>
      </Card>
    </main>
  );
}
