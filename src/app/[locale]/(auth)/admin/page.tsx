"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type RouterOutputs } from "@/trpc/react";
import { useTranslations } from "next-intl";

type PendingLocation = RouterOutputs["location"]["getPending"][number];

const buildMapsLink = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

export default function AdminDashboard() {
  const locale = useLocale();
  const utils = api.useUtils();
  const t = useTranslations("AdminDashboard");
  const [dialog, setDialog] = useState<{
    type: "approve" | "reject";
    location: PendingLocation;
  } | null>(null);

  const {
    data: pendingLocations,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = api.location.getPending.useQuery(undefined, {
    retry(failureCount, err) {
      const code = err.data?.code;
      if (code === "FORBIDDEN" || code === "UNAUTHORIZED") return false;
      return failureCount < 2;
    },
  });

  const approveMutation = api.location.approve.useMutation({
    async onSuccess() {
      toast.success(t("toast_approved"));
      await utils.location.getPending.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSettled: () => setDialog(null),
  });

  const rejectMutation = api.location.reject.useMutation({
    async onSuccess() {
      toast.success(t("toast_rejected"));
      await utils.location.getPending.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSettled: () => setDialog(null),
  });

  const pendingCount = pendingLocations?.length ?? 0;
  const lastUpdated =
    dataUpdatedAt && dataUpdatedAt > 0
      ? new Date(dataUpdatedAt).toLocaleTimeString()
      : "—";

  const locationCards = useMemo(() => {
    if (isLoading) {
      return (
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
      );
    }

    if (isError) {
      const code = error?.data?.code;
      const signInPath = `/${locale}/sign-in`;
      const message =
        code === "UNAUTHORIZED"
          ? t("sign_in_required")
          : code === "FORBIDDEN"
            ? t("admin_required")
            : t("load_failed");

      return (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>{t("unable_to_load")}</CardTitle>
            </div>
            <CardDescription>{message}</CardDescription>
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
            {code === "UNAUTHORIZED" && (
              <Button asChild>
                <Link href={signInPath}>{t("go_to_sign_in")}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    if (!pendingLocations?.length) {
      return (
        <Card className="border-dashed bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              {t("no_pending_title")}
            </CardTitle>
            <CardDescription>
              {t("no_pending_body")}
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {pendingLocations.map((location) => (
          <Card
            key={location.id}
            className="border-l-4 border-l-primary shadow-sm"
          >
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                    {t("pending_review")}
                  </span>
                  <span className="hidden sm:inline">
                    {t("id_label", { id: location.id })}
                  </span>
                </div>
                <a
                  className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                  href={buildMapsLink(location.lat, location.lng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="h-4 w-4" />
                  {t("view_on_map")}
                </a>
              </div>
              <CardTitle className="text-xl">{location.name}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {location.description || t("no_description")}
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
                      {location.creator?.name ?? t("unknown")} (
                      {location.creator?.email ?? t("no_email")})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {location.address}
                    </p>
                    <p>
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setDialog({ type: "approve", location })
                  }
                  disabled={
                    approveMutation.isPending || rejectMutation.isPending
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t("approve")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDialog({ type: "reject", location })}
                  disabled={
                    approveMutation.isPending || rejectMutation.isPending
                  }
                >
                  <XCircle className="h-4 w-4" />
                  {t("reject")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [
    approveMutation.isPending,
    error?.data?.code,
    isError,
    isLoading,
    locale,
    pendingLocations,
    refetch,
    isRefetching,
    rejectMutation.isPending,
  ]);

  const dialogActionPending =
    approveMutation.isPending || rejectMutation.isPending;

  const confirmAction = () => {
    if (!dialog) return;

    if (dialog.type === "approve") {
      approveMutation.mutate({ id: dialog.location.id });
    } else {
      rejectMutation.mutate({ id: dialog.location.id });
    }
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("review_queue")}
          </p>
          <h1 className="text-3xl font-semibold">{t("location_approvals")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("review_copy")}
          </p>
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
              {isLoading ? <Skeleton className="h-8 w-16" /> : pendingCount}
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
              {pendingCount === 0 ? t("clear") : t("active")}
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
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                lastUpdated
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {t("last_synced_help")}
          </CardContent>
        </Card>
      </div>

      {locationCards}

      <AlertDialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {dialog?.type === "approve" ? (
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
              {dialog ? (
                <>
                  {t("dialog_message", {
                    action: t(`dialog_action.${dialog.type}`),
                    location: dialog.location.name,
                  })}
                </>
              ) : (
                t("dialog_empty")
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dialogActionPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={dialogActionPending}
              className={
                dialog?.type === "reject" ? "bg-destructive hover:bg-destructive/90" : undefined
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
