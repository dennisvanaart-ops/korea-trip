import { redirect } from "next/navigation";

// /info is superseded by bottom tab navigation
export default function InfoRedirect() {
  redirect("/flights");
}
