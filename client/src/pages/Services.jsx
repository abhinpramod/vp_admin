import { useEffect, useState } from "react";
import api from "../api/api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [images, setImages] = useState([]);

  const load = async () => {
    const res = await api.get("/services");
    setServices(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const addService = async () => {
    const form = new FormData();
    form.append("title", "Modern Kitchen");
    form.append("category", "Kitchen");
    form.append("totalCost", 250000);
    form.append("duration", "30 days");
    form.append("description", "Premium modular kitchen");

    for (let img of images) {
      form.append("images", img);
    }

    await api.post("/services", form);
    load();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Services</h2>

      <div className="bg-white p-4 rounded mb-6">
        <input type="file" multiple onChange={e => setImages(e.target.files)} />
        <button
          onClick={addService}
          className="mt-3 bg-black text-white px-4 py-2 rounded"
        >
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <div key={s._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm">{s.category}</p>
            <p className="text-sm">₹{s.totalCost}</p>
          </div>
        ))}
      </div>
    </>
  );
}
