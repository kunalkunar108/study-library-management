export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-6 inline-flex rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Project foundation
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          StudyDesk
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Study Library Management Demo
        </p>
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Foundation initialized</p>
          <p className="mt-1 text-sm text-slate-500">
            The corporate interface and library workflows will be built in the next development steps.
          </p>
        </div>
      </section>
    </main>
  );
}