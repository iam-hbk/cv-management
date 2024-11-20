import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

async function signOutAction() {
  "use server";
  await signOut();
  redirect("/login");
}

export default async function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <form action={signOutAction}>
        <Button type="submit">
          <LogOut />
        </Button>
      </form>
    </div>
  );
}
