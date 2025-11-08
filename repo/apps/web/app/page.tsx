import Link from 'next/link';

import { fetchUsers } from '../lib/api';

export default async function Home() {
  const users = await fetchUsers();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-16 px-6 py-24">
      <header className="flex flex-col gap-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">TeamTrack</p>
        <h1 className="text-5xl font-semibold text-slate-100 md:text-6xl">
          Ship features faster with a batteries-included platform.
        </h1>
        <p className="text-lg text-slate-300 md:text-xl">
          Next.js frontend, NestJS API, Prisma ORM, Redis workers, and modern DX out of the box.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
            href="http://localhost:3000/docs"
          >
            Explore API Docs
          </Link>
          <Link
            className="rounded-full border border-slate-600 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400"
            href="https://github.com/example/teamtrack"
          >
            View Source
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 shadow-lg shadow-slate-950/40">
        <h2 className="text-2xl font-semibold text-slate-100">Recently active users</h2>
        <p className="mt-2 text-sm text-slate-400">
          Backed by Prisma + PostgreSQL. Data falls back to a demo user if the API is offline.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-slate-700/60 bg-slate-800/70 p-4 transition hover:border-indigo-400/60"
            >
              <p className="text-base font-medium text-slate-200">{user.name ?? 'Unassigned user'}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
