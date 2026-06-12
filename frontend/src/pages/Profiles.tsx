import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { useProfiles, useCreateProfile, useUpdateProfile, useDeleteProfile } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  initial_balance: z.coerce.number().min(0, "Balance must be 0 or more"),
});

type ProfileForm = z.infer<typeof profileSchema>;

import { CardGridSkeleton } from "@/components/Skeleton";

export default function Profiles() {
  const { data: profiles, isLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number; name: string; description?: string; initial_balance: number } | null>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", description: "", initial_balance: 0 },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", description: "", initial_balance: 0 });
    setOpen(true);
  }

  function openEdit(profile: NonNullable<typeof profiles>[number]) {
    setEditing({ id: profile.id, name: profile.name, description: profile.description || "", initial_balance: profile.initial_balance });
    form.reset({ name: profile.name, description: profile.description || "", initial_balance: profile.initial_balance });
    setOpen(true);
  }

  async function onSubmit(data: ProfileForm) {
    if (editing) {
      await updateProfile.mutateAsync({ id: editing.id, ...data });
    } else {
      await createProfile.mutateAsync(data);
    }
    setOpen(false);
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this profile?")) {
      await deleteProfile.mutateAsync(id);
    }
  }

  if (isLoading) return <CardGridSkeleton count={3} />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profiles</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Profile" : "Create Profile"}</DialogTitle>
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
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...form.register("description")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial_balance">Initial Balance</Label>
                <Input id="initial_balance" type="number" step="0.01" {...form.register("initial_balance")} />
                {form.formState.errors.initial_balance && (
                  <p className="text-sm text-destructive">{form.formState.errors.initial_balance.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={createProfile.isPending || updateProfile.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {profiles?.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No profiles yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles?.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <CardTitle>{profile.name}</CardTitle>
                {profile.description && (
                  <CardDescription>{profile.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₹{Number(profile.current_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Current Balance</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(profile)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}>
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
