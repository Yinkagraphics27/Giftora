import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-800 lg:text-3xl">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all registered users.
        </p>
      </div>
      <Card className="border-dashed border-canvas-300 bg-white">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-100">
            <Users className="h-6 w-6 text-navy-400" />
          </div>
          <p className="font-heading text-lg font-semibold text-navy-800">
            Coming in Session 2
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            List of all users with filters and account details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}