import Button from "@/components/UI/Button";
import LinkButton from "@/components/UI/LinkButton";
import Card, { CardBody, CardFooter, CardHeader } from "@/components/UI/Card";
import Form, { FormField, TextBox } from "@/components/UI/Form";
import Image from "next/image";

import LiteChatLogoH from "@/public/LiteChat-Logo-H.png";

export default function LoginPage() {
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
          <Form>
            <FormField label="Email">
              <TextBox type="email" placeholder="Email"></TextBox>
            </FormField>
            <FormField label="Contraseña">
              <TextBox type="password" placeholder="Contraseña"></TextBox>
            </FormField>

            <Button type="submit" text="Iniciar Sesión" />
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
