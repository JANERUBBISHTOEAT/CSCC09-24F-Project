import { redirect } from "@remix-run/node";

export const loader = () => {
  return redirect("/?message=Page+Not+Found");
};

export default function Files() {
  return null;
}
