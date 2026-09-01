export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="grid min-h-screen bg-ivory lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden bg-sage p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-white/70">Our wedding</p>
      <div><p className="font-display text-7xl font-semibold leading-[.9]">Aayush<br/><span className="italic text-[#ead3cb]">& Grace</span></p><p className="mt-6 max-w-md text-base leading-7 text-white/70">One quiet place for every guest, payment, decision, and wedding-day detail.</p></div>
      <p className="text-xs text-white/60">October 2 · 2027 · Washington</p>
    </section>
    <section className="grid place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-7 sm:p-9">
        <p className="eyebrow">Private planning studio</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-mist">Sign in to continue planning together.</p>
        {error ? <p className="mt-5 rounded-xl bg-[#f7e7e1] px-4 py-3 text-sm text-[#8b4e3e]">That username or password was not recognized.</p> : null}
        <form action="/api/auth/login" className="mt-7 grid gap-4" method="post">
          <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-mist">Username<input autoComplete="username" autoFocus className="rounded-xl border border-line bg-ivory px-4 py-3 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-sage focus:ring-4 focus:ring-sage/10" name="username" required /></label>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-mist">Password<input autoComplete="current-password" className="rounded-xl border border-line bg-ivory px-4 py-3 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-sage focus:ring-4 focus:ring-sage/10" name="password" required type="password" /></label>
          <button className="mt-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-sage">Sign in</button>
        </form>
        <p className="mt-6 text-center text-xs text-mist">Your planning space is private and shared only between you.</p>
      </div>
    </section>
  </main>;
}
