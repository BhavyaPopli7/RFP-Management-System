import { Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Vendors from "./components/Vendors";
import Rfp from "./components/Rfp";
import ProposalSubmitPage from "./components/ProposalSubmitPage";
import AppLayout from "./AppLayout"; 
import "./index.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        {/* All routes that use the sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfp/:id" element={<Rfp />} />
          <Route path="/vendors" element={<Vendors />} />
        </Route>

        <Route path="/proposal/submit" element={<ProposalSubmitPage />} />
      </Routes>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
