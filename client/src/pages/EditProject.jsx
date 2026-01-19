
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    api.get(`/services/${id}`).then(res => {
      const p = res.data;
      setTitle(p.title);
      setCategory(p.category);
      setDuration(p.duration);
      setDescription(p.description);
      setMaterials(p.materials);
    });
  }, [id]);

  const updateProject = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("duration", duration);
    formData.append("description", description);
    formData.append("materials", JSON.stringify(materials));

    for (let img of images) {
      formData.append("images", img);
    }

    await api.put(`/services/${id}`, formData);
    navigate(`/projects/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Edit Project</h2>

      <input
        className="border p-2 w-full mb-2"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        value={category}
        onChange={e => setCategory(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        value={duration}
        onChange={e => setDuration(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-3"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <input
        type="file"
        multiple
        onChange={e => setImages(e.target.files)}
        className="mb-3"
      />

      <button
        onClick={updateProject}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Update Project
      </button>
    </div>
  );
}
