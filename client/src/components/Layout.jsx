import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay (Mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-black text-white p-5
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold mb-8">VP Admin</h2>

        <nav className="space-y-2">
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-white text-black" : "hover:bg-gray-800"
              }`
            }
            onClick={() => setOpen(false)}
          >
            Services / Projects
          </NavLink>

          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-white text-black" : "hover:bg-gray-800"
              }`
            }
            onClick={() => setOpen(false)}
          >
            Gallery
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-white text-black" : "hover:bg-gray-800"
              }`
            }
            onClick={() => setOpen(false)}
          >
            Categories
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="text-xl font-bold"
          >
            ☰
          </button>

          <h3 className="font-semibold">VP Admin</h3>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
