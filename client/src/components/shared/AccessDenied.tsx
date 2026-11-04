import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "../ui/button";

export function AccessDenied() {
  return (
    <div className="max-w-md mx-auto py-24 text-center">
      <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold mb-1">Access denied</h2>
      <p className="text-sm text-muted-foreground mb-5">
        You don't have permission to view this page. Contact a super admin if
        you need access.
      </p>
      <Link to="/admin/overview">
        <Button variant="outline">Back to overview</Button>
      </Link>
    </div>
  );
}
