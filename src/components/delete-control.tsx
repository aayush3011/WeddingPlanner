"use client";

import { useState } from "react";
import { removeFamily, removeGuest } from "@/app/actions";

export function DeleteControl({ id, kind, name }: { id: string; kind: "guest" | "family"; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const action = kind === "family" ? removeFamily : removeGuest;
  const field = kind === "family" ? "familyId" : "guestId";
  if (!confirming) return <button className="text-xs font-semibold text-[#a35d49] hover:underline" onClick={() => setConfirming(true)} type="button">Remove {kind}</button>;
  return <form action={action} className="flex flex-wrap items-center justify-end gap-2 rounded-xl bg-[#f7e7e1] p-2.5">
    <input name={field} type="hidden" value={id} />
    <span className="text-xs text-[#7e493b]">Remove {name}{kind === "family" ? " and every member" : ""}?</span>
    <button className="rounded-lg px-2 py-1 text-xs font-semibold text-mist" onClick={() => setConfirming(false)} type="button">Cancel</button>
    <button className="rounded-lg bg-[#a35d49] px-2.5 py-1.5 text-xs font-bold text-white">Remove</button>
  </form>;
}
