import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, ClipboardList, Printer, Scan, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  resolveUserStatusClass,
  userActionButtonClass,
  userCardClass,
  userOutlineButtonClass,
  userPanelClass,
} from "@/components/dashboard/user-theme";

interface UserDashboardProps {
  userId: string;
}

export async function UserDashboard({ userId }: UserDashboardProps) {
  const supabase = createServiceRoleClient();

  const [
    { count: deviceCount },
    { count: pendingRequests },
    { data: myDevices },
  ] = await Promise.all([
    supabase
      .from("devices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("maintenance_requests")
      .select("*", { count: "exact", head: true })
      .eq("requested_by", userId)
      .eq("status", "pending"),
    supabase.from("devices").select("*").eq("user_id", userId).limit(5),
  ]);

  const stats = [
    {
      label: "My Devices",
      value: deviceCount || 0,
      icon: Cpu,
      color: "text-primary",
    },
    {
      label: "Pending Requests",
      value: pendingRequests || 0,
      icon: ClipboardList,
      color: "text-amber-500",
    },
  ];

  const getDeviceIcon = (type: string) => {
    return type?.toLowerCase().includes("printer") ? (
      <Printer className="h-5 w-5" />
    ) : (
      <Scan className="h-5 w-5" />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your devices and maintenance status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={userCardClass}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={userCardClass}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>My Devices</CardTitle>
              <CardDescription>
                Your registered scanners and printers ({myDevices?.length || 0}{" "}
                shown)
              </CardDescription>
            </div>
            <Link href="/dashboard/my-devices">
              <Button className={userActionButtonClass}>Manage Devices</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {myDevices && myDevices.length > 0 ? (
              <div className="space-y-3">
                {myDevices.map((device: any) => (
                  <div key={device.id} className={userPanelClass}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg border border-border/70 bg-background/70 p-2.5">
                          <span className="text-primary">
                            {getDeviceIcon(device.device_type)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {device.brand} {device.model}
                          </p>
                          <p className="text-sm capitalize text-muted-foreground">
                            {device.device_type}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={resolveUserStatusClass(device.status)}
                      >
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 py-10 text-center">
                <Cpu className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No devices registered</p>
                <p className="text-sm text-muted-foreground">
                  Add your first device to get started
                </p>
                <Link href="/dashboard/my-devices" className="mt-4 inline-block">
                  <Button variant="outline" className={userOutlineButtonClass}>
                    Add Device
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={userCardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Request Status
            </CardTitle>
            <CardDescription>
              Track your maintenance requests and next actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={userPanelClass}>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="mt-1 text-2xl font-semibold">{pendingRequests || 0}</p>
            </div>
            <div className={userPanelClass}>
              <p className="text-sm text-muted-foreground">
                Need to report an issue?
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link href="/dashboard/my-requests" className="w-full">
                  <Button className={`${userActionButtonClass} w-full`}>
                    New Request
                  </Button>
                </Link>
                <Link href="/dashboard/my-requests" className="w-full">
                  <Button
                    variant="outline"
                    className={`${userOutlineButtonClass} w-full`}
                  >
                    View Requests
                  </Button>
                </Link>
              </div>
            </div>
            <Link
              href="/dashboard/my-requests"
              className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <span>Open maintenance request center</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
