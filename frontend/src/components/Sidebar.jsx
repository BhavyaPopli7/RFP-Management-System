import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 border-r border-slate-800">
      <div className="h-16 flex items-center px-4 border-b border-slate-800">
        <span className="text-lg font-semibold">RFP Management System</span>
      </div>

      <nav className="mt-4 space-y-1 px-2 text-sm">
        <Link
          to="/"
          className="block rounded-md px-3 py-2 hover:bg-slate-800"
        >
          Dashboard
        </Link>
        <Link
          to="/vendors"
          className="block rounded-md px-3 py-2 hover:bg-slate-800"
        >
          Vendors
        </Link>
      </nav>
    </aside>
  );
}
