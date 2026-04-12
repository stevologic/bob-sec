import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard";
import { Loading } from "@/components/loading";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-950 to-black p-4 text-white font-mono">
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}