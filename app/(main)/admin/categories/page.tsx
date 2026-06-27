"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCategoriesPage() {
  const supabase = createClient();

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
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("categories")
      .insert({
        name: newCategory,
        display_order: categories.length + 1
      });

    if (!error) {
      await supabase.from("activity_logs").insert({
        admin_id: user?.id,
        action: "added_category",
        target_type: "category",
        details: `Added category: ${newCategory}`
      });
      setNewCategory("");
      fetchCategories();
    }
  };

  const handleUpdateCategory = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("categories")
      .update({ name: editingName })
      .eq("id", id);

    if (!error) {
      await supabase.from("activity_logs").insert({
        admin_id: user?.id,
        action: "updated_category",
        target_type: "category",
        target_id: id,
        details: `Updated category name to: ${editingName}`
      });
      setEditingId(null);
      fetchCategories();
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("categories")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    await supabase.from("activity_logs").insert({
      admin_id: user?.id,
      action: !currentStatus ? "activated_category" : "hidden_category",
      target_type: "category",
      target_id: id,
      details: `Toggled visibility of category`
    });

    fetchCategories();
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const cat1 = categories[index];
    const cat2 = categories[newIndex];

    await supabase.from("categories").update({ display_order: cat2.display_order }).eq("id", cat1.id);
    await supabase.from("categories").update({ display_order: cat1.display_order }).eq("id", cat2.id);

    fetchCategories();
  };

  const deleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" permanently?`)) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("categories").delete().eq("id", id);

      await supabase.from("activity_logs").insert({
        admin_id: user?.id,
        action: "deleted_category",
        target_type: "category",
        details: `Deleted category: ${name}`
      });

      fetchCategories();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Category Management</h1>
        <p className="text-gray-500">Manage apartment categories displayed in listing forms and filters.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
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

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Order</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => moveOrder(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-20"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveOrder(index, "down")}
                        disabled={index === categories.length - 1}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-20"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === cat.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="px-2 py-1 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => handleUpdateCategory(cat.id)} className="text-success font-bold text-sm">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm">Cancel</button>
                      </div>
                    ) : (
                      <span className={`font-medium ${cat.is_active ? "text-text-primary" : "text-gray-400 italic"}`}>
                        {cat.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleVisibility(cat.id, cat.is_active)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.is_active ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className="text-red-500 font-bold text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
