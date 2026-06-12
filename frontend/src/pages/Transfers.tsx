import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Repeat } from "lucide-react";
import { useTransfers, useCreateTransfer } from "@/hooks/useTransfers";
import { useProfiles } from "@/hooks/useProfiles";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Skeleton from "@/components/Skeleton";

const transferSchema = z.object({
  source_profile_id: z.coerce.number({ message: "Source profile is required" }),
  destination_profile_id: z.coerce.number({ message: "Destination profile is required" }),
  amount: z.coerce.number().positive("Amount must be positive"),
}).refine((data) => data.source_profile_id !== data.destination_profile_id, {
  message: "Source and destination must be different",
  path: ["destination_profile_id"],
});

type TransferForm = z.infer<typeof transferSchema>;

export default function Transfers() {
  const { data: transfers, isLoading } = useTransfers();
  const { data: profiles } = useProfiles();
  const createTransfer = useCreateTransfer();
  const [success, setSuccess] = useState(false);

  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
  });

  async function onSubmit(values: TransferForm) {
    await createTransfer.mutateAsync(values);
    form.reset();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transfers</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select
                  value={form.watch("source_profile_id")?.toString()}
                  onValueChange={(v) => form.setValue("source_profile_id", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} (₹{Number(p.current_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.source_profile_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.source_profile_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Select
                  value={form.watch("destination_profile_id")?.toString()}
                  onValueChange={(v) => form.setValue("destination_profile_id", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} (₹{Number(p.current_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.destination_profile_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.destination_profile_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.01" {...form.register("amount")} />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={createTransfer.isPending}>
                {createTransfer.isPending ? "Transferring..." : "Transfer"}
              </Button>

              {success && (
                <p className="text-sm text-green-600 text-center">Transfer completed successfully!</p>
              )}
              {createTransfer.isError && (
                <p className="text-sm text-destructive text-center">
                  {(createTransfer.error as Error).message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : transfers?.length === 0 ? (
              <div className="text-center py-8">
                <Repeat className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No transfers yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers?.map((t) => {
                  const src = profiles?.find((p) => p.id === t.source_profile_id);
                  const dst = profiles?.find((p) => p.id === t.destination_profile_id);
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {src?.name || "?"} → {dst?.name || "?"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        ₹{Number(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
