import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Left sidebar */}
      <Sidebar />

      {/* Right side content */}
      <div className="ml-64">
        <main>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
