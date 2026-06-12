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
          <Form>
            <FormField label="Nombre(s)" required>
              <TextBox placeholder="Nombre"></TextBox>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Primer apellido" required>
                <TextBox placeholder="Primer apellido"></TextBox>
              </FormField>
              <FormField label="Segundo apellido">
                <TextBox placeholder="Segundo apellido"></TextBox>
              </FormField>
            </div>
            <FormField>
              <Toggle label="Apellido(s) primero" />
            </FormField>
            <FormField label="Fecha de Nacimiento" required>
              <DateTimePicker mode="date" placeholder="Seleccionar Fecha" />
            </FormField>
            <FormField label="Teléfono" required>
              <TextBox placeholder="Teléfono +52"></TextBox>
            </FormField>
            <FormField label="Email" required>
              <TextBox type="email" placeholder="Email"></TextBox>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Contraseña" required>
                <TextBox type="password" placeholder="Contraseña"></TextBox>
              </FormField>
              <FormField label="Confirmar Contraseña" required>
                <TextBox placeholder="Confirmar Contraseña"></TextBox>
              </FormField>
            </div>

            <Button type="submit" text="Registrarse" />
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
