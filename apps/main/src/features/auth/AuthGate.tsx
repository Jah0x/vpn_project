import LoginPage from "@/pages/LoginPage";

export function AuthGate({ children }: { children: JSX.Element }) {
  if (!localStorage.getItem("access_token")) return <LoginPage />;
  return children;
}
