import { useState } from "react";
import api from "../api/api";

export default function AddService() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState([{ name: "", description: "" }]);
  const [images, setImages] = useState([]);

  const addMaterial = () => {
    setMaterials([...materials, { name: "", description: "" }]);
  };

  const handleMaterialChange = (i, field, value) => {
    const updated = [...materials];
    updated[i][field] = value;
    setMaterials(updated);
  };

  const submitService = async () => {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("duration", duration);
    formData.append("description", description);
    formData.append("materials", JSON.stringify(materials));

    for (let img of images) {
      formData.append("images", img);
    }

    await api.post("/services", formData);
    alert("Service added successfully");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Add Project</h2>

      {/* Project Title */}
      <input
        className="border p-2 w-full mb-3"
        placeholder="Project Title"
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Category Name */}
      <input
        className="border p-2 w-full mb-3"
        placeholder="Category (Kitchen / Bedroom / Full Home)"
        onChange={(e) => setCategory(e.target.value)}
      />

      {/* Duration */}
      <input
        className="border p-2 w-full mb-3"
        placeholder="Duration (eg: 45 days)"
        onChange={(e) => setDuration(e.target.value)}
      />

      {/* Description */}
      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Project Description"
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Materials */}
      <div className="mb-3">
        <p className="font-medium mb-2">Materials Used</p>
        {materials.map((m, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="border p-2 flex-1"
              placeholder="Material Name"
              onChange={(e) =>
                handleMaterialChange(i, "name", e.target.value)
              }
            />
            <input
              className="border p-2 flex-1"
              placeholder="Material Description"
              onChange={(e) =>
                handleMaterialChange(i, "description", e.target.value)
              }
            />
          </div>
        ))}
        <button
          onClick={addMaterial}
          className="text-sm text-blue-600"
        >
          + Add Material
        </button>
      </div>

      {/* Images */}
      <input
        type="file"
        multiple
        className="mb-4"
        onChange={(e) => setImages(e.target.files)}
      />

      <button
        onClick={submitService}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Save Project
      </button>
    </div>
  );
}
