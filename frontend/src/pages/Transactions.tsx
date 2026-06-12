import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from "@/hooks/useTransactions";
import { useProfiles } from "@/hooks/useProfiles";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/Skeleton";

const transactionSchema = z.object({
  profile_id: z.coerce.number({ message: "Profile is required" }),
  category_id: z.coerce.number().optional(),
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  transaction_date: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterProfile, setFilterProfile] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number } | null>(null);

  const filters = {
    search: search || undefined,
    profile_id: filterProfile ? Number(filterProfile) : undefined,
    category_id: filterCategory ? Number(filterCategory) : undefined,
    type: filterType || undefined,
    page,
    page_size: 20,
  };

  const { data, isLoading } = useTransactions(filters);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const { data: profiles } = useProfiles();
  const { data: categories } = useCategories();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "DEBIT", amount: 0, title: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ profile_id: undefined, category_id: undefined, type: "DEBIT", amount: 0, title: "", notes: "", transaction_date: new Date().toISOString().split("T")[0] });
    setDialogOpen(true);
  }

  async function onSubmit(values: TransactionForm) {
    const payload = {
      ...values,
      transaction_date: values.transaction_date || undefined,
      category_id: values.category_id || undefined,
    };
    if (editing) {
      await updateTransaction.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createTransaction.mutateAsync(payload);
    }
    setDialogOpen(false);
  }

  async function handleDelete(id: number) {
    if (confirm("Delete this transaction?")) {
      await deleteTransaction.mutateAsync(id);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Transaction" : "Create Transaction"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v as "CREDIT" | "DEBIT")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Profile</Label>
                <Select
                  value={form.watch("profile_id")?.toString()}
                  onValueChange={(v) => form.setValue("profile_id", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.profile_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.profile_id.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.watch("category_id")?.toString()}
                  onValueChange={(v) => form.setValue("category_id", v ? Number(v) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.01" {...form.register("amount")} />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" {...form.register("notes")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Date</Label>
                <Input id="transaction_date" type="date" {...form.register("transaction_date")} />
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={filterProfile} onValueChange={(v) => { setFilterProfile(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All profiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All profiles</SelectItem>
              {profiles?.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
              <SelectItem value="DEBIT">Debit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
      {isLoading ? (
        <TableSkeleton />
      ) : data?.items.length === 0 ? (
        <div className="text-center py-12">
          <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No transactions found.</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                  <th className="text-left p-3 text-sm font-medium">Title</th>
                  <th className="text-left p-3 text-sm font-medium">Type</th>
                  <th className="text-left p-3 text-sm font-medium">Category</th>
                  <th className="text-right p-3 text-sm font-medium">Amount</th>
                  <th className="p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-sm">
                      {new Date(txn.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm">{txn.title}</td>
                    <td className="p-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        txn.type === "CREDIT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {categories?.find((c) => c.id === txn.category_id)?.name || "-"}
                    </td>
                    <td className={`p-3 text-sm text-right font-medium ${
                      txn.type === "CREDIT" ? "text-green-600" : "text-red-600"
                    }`}>
                      {txn.type === "CREDIT" ? "+" : "-"}₹
                      {Number(txn.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditing({ id: txn.id });
                          form.reset({
                            profile_id: txn.profile_id,
                            category_id: txn.category_id || undefined,
                            type: txn.type,
                            amount: Number(txn.amount),
                            title: txn.title,
                            notes: txn.notes || "",
                            transaction_date: new Date(txn.transaction_date).toISOString().split("T")[0],
                          });
                          setDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(txn.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.total > data.page_size && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {Math.ceil(data.total / data.page_size)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / data.page_size)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
