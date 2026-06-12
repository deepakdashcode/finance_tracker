import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
});

type CategoryForm = z.infer<typeof categorySchema>;

import { CardGridSkeleton } from "@/components/Skeleton";

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number; name: string; color: string } | null>(null);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", color: "#6366f1" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", color: "#6366f1" });
    setOpen(true);
  }

  function openEdit(category: NonNullable<typeof categories>[number]) {
    setEditing({ id: category.id, name: category.name, color: category.color });
    form.reset({ name: category.name, color: category.color });
    setOpen(true);
  }

  async function onSubmit(data: CategoryForm) {
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, ...data });
    } else {
      await createCategory.mutateAsync(data);
    }
    setOpen(false);
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory.mutateAsync(id);
    }
  }

  if (isLoading) return <CardGridSkeleton count={6} />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input id="color" type="color" className="w-12 p-1 h-9" {...form.register("color")} />
                  <Input value={form.watch("color")} readOnly className="font-mono" />
                </div>
                {form.formState.errors.color && (
                  <p className="text-sm text-destructive">{form.formState.errors.color.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={createCategory.isPending || updateCategory.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {categories?.length === 0 ? (
        <div className="text-center py-12">
          <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No categories yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
