"use client";

import { useState } from "react";
import { addFamily, addGuest } from "@/app/actions";
import { buttonClass, Field, inputClass } from "@/components/card";

const mealOptions = <><option value="">Select meal</option><option value="salmon">Salmon</option><option value="chicken">Chicken</option><option value="vegetarian">Vegetarian</option></>;
const rsvpOptions = <><option value="pending">Pending</option><option value="attending">Attending</option><option value="declined">Declined</option><option value="tentative">Tentative</option></>;

export function AddGuestForm() {
  return <form action={addGuest} className="grid gap-4">
    <div className="grid grid-cols-2 gap-3"><Field label="First name"><input className={inputClass} name="firstName" required /></Field><Field label="Last name"><input className={inputClass} name="lastName" required /></Field></div>
    <div className="grid grid-cols-2 gap-3"><Field label="Side"><select className={inputClass} name="side"><option value="aayush_groom">Aayush</option><option value="grace_bride">Grace</option><option value="both">Shared</option></select></Field><Field label="Guest type"><select className={inputClass} name="ageBand"><option value="adult">Adult</option><option value="child">Child</option><option value="toddler">Toddler</option></select></Field></div>
    <Field label="Gender"><select className={inputClass} name="gender"><option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option><option value="other">Other</option></select></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="RSVP"><select className={inputClass} name="rsvpStatus">{rsvpOptions}</select></Field><Field label="Meal"><select className={inputClass} name="mealChoice">{mealOptions}</select></Field></div>
    <Field label="Dietary or allergy notes"><input className={inputClass} name="dietary" /></Field>
    <Field label="Notes"><textarea className={inputClass} name="notes" rows={3} /></Field>
    <button className={buttonClass}>Add guest</button>
  </form>;
}

export function AddFamilyForm() {
  const [members, setMembers] = useState([0, 1]);
  const [nextId, setNextId] = useState(2);
  const addMember = () => { setMembers([...members, nextId]); setNextId(nextId + 1); };
  return <form action={addFamily} className="grid gap-5">
    <Field label="Family name"><input className={inputClass} name="familyName" placeholder="Patel Family" required /></Field>
    <div className="flex items-center justify-between border-b border-line pb-3"><div><p className="text-sm font-semibold">Family members</p><p className="mt-1 text-xs text-mist">Add every adult and child on this invitation.</p></div><span className="rounded-full bg-sage-light px-3 py-1 text-xs font-bold text-sage-dark">{members.length}</span></div>
    {members.map((id, index) => <section className="rounded-2xl border border-line bg-white p-4" key={id}>
      <div className="mb-4 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-mist">Person {index + 1}</p>{members.length > 1 ? <button className="text-xs font-semibold text-[#a35d49]" onClick={() => setMembers(members.filter(member => member !== id))} type="button">Remove</button> : null}</div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="First name"><input className={inputClass} name="firstName" required /></Field><Field label="Last name"><input className={inputClass} name="lastName" required /></Field><Field label="Gender"><select className={inputClass} name="gender"><option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option><option value="other">Other</option></select></Field><Field label="Side"><select className={inputClass} name="side"><option value="aayush_groom">Aayush</option><option value="grace_bride">Grace</option><option value="both">Shared</option></select></Field><Field label="Guest type"><select className={inputClass} name="ageBand"><option value="adult">Adult</option><option value="child">Child</option><option value="toddler">Toddler</option></select></Field><Field label="RSVP"><select className={inputClass} name="rsvpStatus">{rsvpOptions}</select></Field><Field label="Meal"><select className={inputClass} name="mealChoice">{mealOptions}</select></Field></div>
      <div className="mt-3"><Field label="Dietary or allergy notes"><input className={inputClass} name="dietary" /></Field></div>
    </section>)}
    <button className="rounded-xl border border-dashed border-sage/50 bg-sage-light/50 px-4 py-3 text-sm font-semibold text-sage-dark" onClick={addMember} type="button">+ Add another family member</button>
    <button className={buttonClass}>Create family with {members.length} {members.length === 1 ? "guest" : "guests"}</button>
  </form>;
}
