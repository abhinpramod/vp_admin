import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    api.get(`/services/${id}`).then(res => setProject(res.data));
  }, [id]);

  const deleteProject = async () => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/services/${id}`);
    navigate("/projects");
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-4">
      <img
        src={`https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${project.images[0]}`}
        className="w-full h-64 object-cover rounded"
      />

      <h2 className="text-2xl font-bold mt-4">{project.title}</h2>
      <p className="text-gray-600">{project.category}</p>

      <p className="mt-2">
        <strong>Duration:</strong> {project.duration}
      </p>

      <p className="mt-3">{project.description}</p>

      <div className="mt-4">
        <h4 className="font-semibold">Materials</h4>
        <ul className="list-disc ml-5">
          {project.materials.map((m, i) => (
            <li key={i}>
              {m.name} – {m.description}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate(`/edit-project/${id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Edit
        </button>

        <button
          onClick={deleteProject}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
