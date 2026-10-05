import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "ব্যানার পরিচালনা — SOT TOK" },
    { name: "description", content: "SOT TOK ব্যানার পরিচালনার অবস্থা।" },
    { property: "og:title", content: "ব্যানার পরিচালনা — SOT TOK" },
    { property: "og:description", content: "SOT TOK ব্যানার পরিচালনার অবস্থা।" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  // The former form referenced a table that does not exist. Keep this
  // destination available without attempting unauthorised/nonexistent writes.
  return (
    <div className="mx-auto min-h-dvh max-w-2xl space-y-4 bg-background p-6 text-foreground">
      <h1 className="text-2xl font-bold">SOT TOK — ব্যানার পরিচালনা</h1>
      <p role="status" className="text-muted-foreground">ব্যানার পরিচালনা এখন উপলব্ধ নয়।</p>
    </div>
  );
}