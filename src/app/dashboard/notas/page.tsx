import { redirect } from "next/navigation";

export default function NotasPage() {
  // Redirigir al dashboard principal mientras se construye
  redirect("/dashboard");
}
