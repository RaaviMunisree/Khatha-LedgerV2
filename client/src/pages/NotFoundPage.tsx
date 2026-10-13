import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

import Button from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";

export default function NotFoundPage() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-5xl font-black tracking-tight text-slate-900">
            404
          </CardTitle>
          <CardDescription className="text-base">
            We couldn't find the page{" "}
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[13px] text-slate-800">
              {location.pathname}
            </code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <p className="text-sm text-slate-500">
            It may have been moved, renamed, or never existed.
          </p>
          <Link to="/">
            <Button leftIcon={<Home className="h-4 w-4" />}>
              Go to home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
