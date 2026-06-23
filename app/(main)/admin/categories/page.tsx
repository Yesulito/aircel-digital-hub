"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { useRouter } from "next/navigation";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchCategories();
      }
    };
    checkAdmin();
  }, [supabase, router, fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const { error } = await supabase
      .from("categories")
      .insert({
        name: newCategory,
        display_order: categories.length + 1
      });

    if (!error) {
      setNewCategory("");
      fetchCategories();
    }
  };

  const handleUpdateCategory = async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .update({ name: editingName })
      .eq("id", id);

    if (!error) {
      setEditingId(null);
      fetchCategories();
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    await supabase
      .from("categories")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category permanently?")) {
      await supabase.from("categories").delete().eq("id", id);
      fetchCategories();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">Manage Categories</h1>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="flex gap-4">
            <input
              type="text"
              className="flex-grow px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Penthouse"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button type="submit" className="btn-primary">Add Category</button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Name</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading categories...</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="px-2 py-1 border border-border rounded"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                          <button onClick={() => handleUpdateCategory(cat.id)} className="text-success font-bold">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400">Cancel</button>
                        </div>
                      ) : (
                        <span className={cat.is_active ? "text-text-primary" : "text-gray-400 italic"}>
                          {cat.name} {!cat.is_active && "(Hidden)"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVisibility(cat.id, cat.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          cat.is_active ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.is_active ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 flex gap-4">
                      <button
                        onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                        className="text-primary font-bold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-error font-bold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
