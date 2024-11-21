import { redirect } from "@remix-run/node";

// Match any unknown page and redirect
export const loader = async () => {
  return redirect("/?message=Page+Not+Found");
};
