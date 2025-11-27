"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: pendingLocations, refetch } =
    api.location.getPending.useQuery();
  const approveMutation = api.location.approve.useMutation({
    onSuccess: () => {
      toast.success("Location approved");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  const rejectMutation = api.location.reject.useMutation({
    onSuccess: () => {
      toast.success("Location rejected");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  if (!pendingLocations) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard - Pending Locations
      </h1>
      <div className="grid gap-4">
        {pendingLocations.length === 0 ? (
          <p>No pending locations.</p>
        ) : (
          pendingLocations.map((location) => (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{location.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  By: {location.creator?.name} ({location.creator?.email})
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Location: {location.address} ({location.lat}, {location.lng})
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => approveMutation.mutate({ id: location.id })}
                    disabled={approveMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate({ id: location.id })}
                    disabled={rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
