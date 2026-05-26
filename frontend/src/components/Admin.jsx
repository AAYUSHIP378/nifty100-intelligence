import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="p-10 bg-slate-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="mt-4">Protected Page</p>
    </div>
  );
}

export default Admin;