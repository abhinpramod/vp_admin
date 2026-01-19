import { useEffect, useState } from "react";
import api from "../api/api";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");

  const fetchGallery = async () => {
    const res = await api.get("/gallery");
    setImages(res.data);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const uploadImage = async () => {
    if (!file || !category) return alert("Select image & category");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);

    await api.post("/gallery", formData);
    setFile(null);
    setCategory("");
    fetchGallery();
  };

  const deleteImage = async (id) => {
    await api.delete(`/gallery/${id}`);
    fetchGallery();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gallery</h2>

      {/* Upload Section */}
      <div className="bg-white p-4 rounded mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="flex-1"
        />

        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Living Room">Living Room</option>
          <option value="Wardrobe">Wardrobe</option>
        </select>

        <button
          onClick={uploadImage}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img._id}
            className="bg-white rounded shadow overflow-hidden"
          >
            <img
              src={`https://res.cloudinary.com/<YOUR_CLOUD_NAME>/image/upload/${img.publicId}`}
              alt={img.category}
              className="w-full h-48 object-cover"
            />

            <div className="p-3 flex justify-between items-center">
              <span className="text-sm font-medium">{img.category}</span>

              <button
                onClick={() => deleteImage(img._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
