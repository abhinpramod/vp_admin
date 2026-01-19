import { useEffect, useState } from "react";
import api from "../api/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/services").then(res => setProjects(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <div key={p._id} className="bg-white rounded shadow overflow-hidden">
            {/* Cover Image */}
            <img
              src={`https://res.cloudinary.com/<YOUR_CLOUD_NAME>/image/upload/${p.images[0]}`}
              className="h-48 w-full object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.category}</p>

              <p className="text-sm mt-2">
                <strong>Duration:</strong> {p.duration}
              </p>

              <p className="text-sm mt-2">{p.description}</p>

              <div className="mt-3">
                <p className="font-medium text-sm">Materials:</p>
                <ul className="text-sm list-disc ml-5">
                  {p.materials.map((m, i) => (
                    <li key={i}>
                      {m.name} – {m.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
