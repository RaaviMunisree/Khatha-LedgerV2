import { Link } from "react-router-dom";

interface SimplePageProps {
  title: string;
  description: string;
}

const SimplePage = ({
  title,
  description,
}: SimplePageProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          {description}
        </p>

        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-slate-900 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default SimplePage;