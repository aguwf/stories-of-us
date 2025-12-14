"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { api, type RouterOutputs } from "@/trpc/react";

type QueueItem = RouterOutputs["location"]["getQueue"][number];

const buildMapsLink = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const parseDetails = (details: unknown) => {
  if (!details) return {};
  if (typeof details === "string") {
    try {
      return JSON.parse(details) as Record<string, unknown>;
    } catch (error) {
      console.error("Failed to parse details", error);
      return {};
    }
  }
  if (typeof details === "object") return details as Record<string, unknown>;
  return {};
};

const readable = (value: unknown) => {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getChangedFields = (item: QueueItem) => {
  if (!item.location || item.type === "new") return [];
  const payload = item.payload;
  const current = item.location;

  const changes: Array<{ field: string; from: string; to: string }> = [];
  const pairs: Array<[string, unknown, unknown]> = [
    ["Name", current.name, payload.name],
    ["Address", current.address, payload.address],
    ["Description", current.description, payload.description],
    ["Latitude", current.lat, payload.lat],
    ["Longitude", current.lng, payload.lng],
  ];

  const currentDetails = parseDetails(current.details);
  const payloadDetails = parseDetails(payload.details);

  Object.entries(payloadDetails).forEach(([key, value]) => {
    pairs.push([`Details.${key}`, currentDetails?.[key], value]);
  });

  pairs.forEach(([field, from, to]) => {
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes.push({ field, from: readable(from), to: readable(to) });
    }
  });

  return changes;
};

const statusBadge = (status: QueueItem["status"]) => {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100";
  }
};

export default function AdminDashboard() {
  const locale = useLocale();
  const t = useTranslations("AdminDashboard");
  const utils = api.useUtils();
  const [statusFilter, setStatusFilter] = useState<QueueItem["status"][]>([
    "pending",
  ]);
  const [dialog, setDialog] = useState<{
    action: "approve" | "reject";
    item: QueueItem;
    note: string;
    duplicateId?: number;
  } | null>(null);

  const {
    data: queue,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = api.location.getQueue.useQuery(
    { status: statusFilter },
    {
      retry(failureCount, err) {
        const code = err.data?.code;
        if (code === "FORBIDDEN" || code === "UNAUTHORIZED") return false;
        return failureCount < 2;
      },
    }
  );

  const reviewMutation = api.location.reviewSubmission.useMutation({
    async onSuccess() {
      toast.success(t("toast_approved"));
      await utils.location.getQueue.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSettled: () => setDialog(null),
  });

  const counts = useMemo(() => {
    const base = { pending: 0, approved: 0, rejected: 0 };
    queue?.forEach((item) => {
      base[item.status] += 1;
    });
    return base;
  }, [queue]);

  const lastUpdated =
    dataUpdatedAt && dataUpdatedAt > 0
      ? new Date(dataUpdatedAt).toLocaleTimeString()
      : "—";

  const dialogActionPending = reviewMutation.isPending;

  const confirmAction = () => {
    if (!dialog) return;
    reviewMutation.mutate({
      id: dialog.item.id,
      action: dialog.action,
      note: dialog.note || undefined,
      markDuplicateOf: dialog.duplicateId || undefined,
    });
  };

  const renderQueueCard = (item: QueueItem) => {
    const changes = getChangedFields(item);
    const details = parseDetails(item.payload.details);

    return (
      <Card key={item.id} className="border-l-4 border-l-primary shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Badge className={statusBadge(item.status)}>{item.status}</Badge>
              <Badge variant="secondary">{item.type}</Badge>
              <span className="hidden sm:inline">
                {t("id_label", { id: item.id })}
              </span>
            </div>
            <a
              className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
              href={buildMapsLink(item.payload.lat, item.payload.lng)}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin className="h-4 w-4" />
              {t("view_on_map")}
            </a>
          </div>
          <CardTitle className="text-xl">{item.payload.name}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {item.payload.description || t("no_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {t("submitted_by")}
                </p>
                <p>
                  {item.creator?.name ?? t("unknown")} (
                  {item.creator?.email ?? t("no_email")})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {item.payload.address}
                </p>
                <p>
                  {item.payload.lat.toFixed(5)}, {item.payload.lng.toFixed(5)}
                </p>
              </div>
            </div>
          </div>

          {item.reason && (
            <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-sm">
              <p className="font-semibold text-primary">
                {t("submitter_reason")}
              </p>
              <p className="text-muted-foreground">{item.reason}</p>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <p className="font-semibold text-foreground">
              {item.type === "new"
                ? t("submitted_payload")
                : t("changes")}
            </p>
            {item.type === "new" ? (
              <div className="grid gap-2 rounded-md border bg-muted/30 p-3 sm:grid-cols-2">
                <p>
                  <span className="font-medium">Name:</span> {item.payload.name}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {item.payload.address}
                </p>
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {item.payload.description || "—"}
                </p>
                <p>
                  <span className="font-medium">Details:</span>{" "}
                  {readable(details)}
                </p>
              </div>
            ) : changes.length ? (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                {changes.map((change) => (
                  <div
                    key={change.field}
                    className="flex flex-col gap-1 rounded-md bg-white/70 p-2 text-xs shadow-sm dark:bg-gray-900/50"
                  >
                    <p className="font-semibold text-foreground">
                      {change.field}
                    </p>
                    <p className="text-muted-foreground">
                      {t("from_label")}: {change.from}
                    </p>
                    <p className="text-foreground">
                      {t("to_label")}: {change.to}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {t("no_changes_detected")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {t("type_label")}: {item.type}
            </Badge>
            {item.duplicateOf && (
              <Badge variant="outline">
                {t("duplicate_of")}: #{item.duplicateOf}
              </Badge>
            )}
          </div>

          {item.status === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setDialog({ action: "approve", item, note: "" })}
                disabled={reviewMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("approve")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDialog({ action: "reject", item, note: "" })}
                disabled={reviewMutation.isPending}
              >
                <XCircle className="h-4 w-4" />
                {t("reject")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge className={statusBadge(item.status)}>{item.status}</Badge>
              {item.decisionNote && (
                <span>
                  {t("moderator_note")} {item.decisionNote}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("review_queue")}
          </p>
          <h1 className="text-3xl font-semibold">{t("location_approvals")}</h1>
          <p className="text-sm text-muted-foreground">{t("review_copy")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            isLoading={isRefetching}
          >
            <RefreshCw className="h-4 w-4" />
            {t("refresh")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("pending")}</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : counts.pending}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {t("pending_help")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("queue_health")}</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {counts.pending === 0 ? t("clear") : t("active")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {t("queue_help")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("last_synced")}</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {isLoading ? <Skeleton className="h-7 w-24" /> : lastUpdated}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {t("last_synced_help")}
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="pending"
        value={statusFilter[0] ?? "pending"}
        onValueChange={(value) =>
          setStatusFilter([value as QueueItem["status"]])
        }
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending">{t("pending")}</TabsTrigger>
          <TabsTrigger value="approved">{t("approved")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("rejected")}</TabsTrigger>
        </TabsList>
        <TabsContent value={statusFilter[0] ?? "pending"} className="space-y-4">
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="border-dashed">
                  <CardHeader className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle>{t("unable_to_load")}</CardTitle>
                </div>
                <CardDescription>
                  {error?.data?.code === "UNAUTHORIZED"
                    ? t("sign_in_required")
                    : error?.data?.code === "FORBIDDEN"
                    ? t("admin_required")
                    : t("load_failed")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  isLoading={isRefetching}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("retry")}
                </Button>
                {error?.data?.code === "UNAUTHORIZED" && (
                  <Button asChild>
                    <Link href={`/${locale}/sign-in`}>
                      {t("go_to_sign_in")}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : queue && queue.length ? (
            <div className="grid gap-4">{queue.map(renderQueueCard)}</div>
          ) : (
            <Card className="border-dashed bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  {t("no_pending_title")}
                </CardTitle>
                <CardDescription>{t("no_pending_body")}</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {dialog?.action === "approve" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  {t("dialog_approve_title")}
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  {t("dialog_reject_title")}
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog
                ? t("dialog_message", {
                    action: t(`dialog_action.${dialog.action}`),
                    location: dialog.item.payload.name,
                  })
                : t("dialog_empty")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="note">{t("moderator_note")}</Label>
              <Textarea
                id="note"
                value={dialog?.note ?? ""}
                onChange={(e) =>
                  setDialog((prev) =>
                    prev ? { ...prev, note: e.target.value } : prev
                  )
                }
                placeholder={t("note_placeholder")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duplicateId">{t("mark_duplicate")}</Label>
              <Input
                id="duplicateId"
                type="number"
                value={dialog?.duplicateId ?? ""}
                onChange={(e) =>
                  setDialog((prev) =>
                    prev
                      ? {
                          ...prev,
                          duplicateId: e.target.valueAsNumber || undefined,
                        }
                      : prev
                  )
                }
                placeholder={
                  t("duplicate_placeholder")
                }
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dialogActionPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={dialogActionPending}
              className={
                dialog?.action === "reject"
                  ? "bg-destructive hover:bg-destructive/90"
                  : undefined
              }
            >
              {dialogActionPending ? t("working") : t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
