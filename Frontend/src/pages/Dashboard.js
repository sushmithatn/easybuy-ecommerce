import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  return role === "ADMIN" ? <AdminDashboard /> : <UserDashboard />;
}
