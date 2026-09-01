"use client";

import { useRef, useState } from "react";
import { addFamily, addFamilyMember, addGuest, updateFamily } from "@/app/actions";
import { buttonClass, Field, inputClass } from "@/components/card";

const sideOptions = <>
  <option value="aayush">Aayush</option>
  <option value="grace">Grace</option>
  <option value="both">Shared</option>
</>;

const guestTypeOptions = <>
  <option value="adult">Adult</option>
  <option value="teenager">Teenager</option>
  <option value="kid">Kid</option>
  <option value="toddler">Toddler (4 & under)</option>
</>;

function normalizedSide(side: string | null) {
  if (side === "aayush" || side === "aayush_groom") return "aayush";
  if (side === "grace" || side === "grace_bride") return "grace";
  return "both";
}

function normalizedGuestType(ageBand: string) {
  return ageBand === "child" ? "kid" : ageBand;
}

export function AddGuestForm() {
  return <form action={addGuest} className="grid gap-4">
    <Field label="Name"><input className={inputClass} name="firstName" required /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Side"><select className={inputClass} name="side">{sideOptions}</select></Field>
      <Field label="Guest type"><select className={inputClass} name="ageBand">{guestTypeOptions}</select></Field>
    </div>
    <p className="rounded-xl bg-sage-light px-4 py-3 text-xs leading-5 text-sage-dark">Ceremony RSVP will start as Pending. Add the response and meal choice later.</p>
    <Field label="Dietary or allergy notes"><input className={inputClass} name="dietary" /></Field>
    <Field label="Notes"><textarea className={inputClass} name="notes" rows={3} /></Field>
    <button className={buttonClass}>Add guest</button>
  </form>;
}

export function AddFamilyForm() {
  const [members, setMembers] = useState([0, 1]);
  const [nextId, setNextId] = useState(2);
  const formRef = useRef<HTMLFormElement>(null);
  const addMember = () => { setMembers([...members, nextId]); setNextId(nextId + 1); };
  const createFamily = async (formData: FormData) => {
    await addFamily(formData);
    setMembers([0, 1]);
    setNextId(2);
    formRef.current?.reset();
  };

  return <form action={createFamily} className="grid gap-5" ref={formRef}>
    <Field label="Family name"><input className={inputClass} name="familyName" placeholder="Patel Family" required /></Field>
    <div className="flex items-center justify-between border-b border-line pb-3">
      <div><p className="text-sm font-semibold">Family members</p><p className="mt-1 text-xs text-mist">Add every adult and child on this invitation.</p></div>
      <span className="rounded-full bg-sage-light px-3 py-1 text-xs font-bold text-sage-dark">{members.length}</span>
    </div>
    {members.map((id, index) => <section className="rounded-2xl border border-line bg-white p-4" key={id}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-mist">Person {index + 1}</p>
        {members.length > 1 ? <button className="text-xs font-semibold text-[#a35d49]" onClick={() => setMembers(members.filter((member) => member !== id))} type="button">Remove</button> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name"><input className={inputClass} name="firstName" required /></Field>
        <Field label="Side"><select className={inputClass} name="side">{sideOptions}</select></Field>
        <Field label="Guest type"><select className={inputClass} name="ageBand">{guestTypeOptions}</select></Field>
      </div>
      <div className="mt-3"><Field label="Dietary or allergy notes"><input className={inputClass} name="dietary" /></Field></div>
    </section>)}
    <p className="rounded-xl bg-sage-light px-4 py-3 text-xs leading-5 text-sage-dark">Every family member will start with a Pending ceremony RSVP. Responses and meals can be added afterward.</p>
    <button className="rounded-xl border border-dashed border-sage/50 bg-sage-light/50 px-4 py-3 text-sm font-semibold text-sage-dark" onClick={addMember} type="button">+ Add another family member</button>
    <button className={buttonClass}>Create family with {members.length} {members.length === 1 ? "guest" : "guests"}</button>
  </form>;
}

export function AddFamilyMemberForm({ familyId, familyName }: { familyId: string; familyName: string }) {
  return <form action={addFamilyMember} className="grid gap-4">
    <input name="familyId" type="hidden" value={familyId} />
    <p className="rounded-xl bg-linen px-4 py-3 text-sm text-mist">Adding this guest to <strong className="text-ink">{familyName}</strong>.</p>
    <Field label="Name"><input className={inputClass} name="firstName" required /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Side"><select className={inputClass} name="side">{sideOptions}</select></Field>
      <Field label="Guest type"><select className={inputClass} name="ageBand">{guestTypeOptions}</select></Field>
    </div>
    <Field label="Dietary or allergy notes"><input className={inputClass} name="dietary" /></Field>
    <Field label="Notes"><textarea className={inputClass} name="notes" rows={3} /></Field>
    <p className="rounded-xl bg-sage-light px-4 py-3 text-xs leading-5 text-sage-dark">This guest will start with a Pending ceremony RSVP.</p>
    <button className={buttonClass}>Add family member</button>
  </form>;
}

type EditableMember = {
  id: string;
  firstName: string;
  side: string | null;
  ageBand: string;
  dietary: string | null;
  notes: string | null;
};

export function EditFamilyForm({ family }: { family: { id: string; name: string; guests: EditableMember[] } }) {
  return <form action={updateFamily} className="grid gap-5">
    <input name="familyId" type="hidden" value={family.id} />
    <Field label="Family name"><input className={inputClass} defaultValue={family.name} name="familyName" required /></Field>
    <div className="border-b border-line pb-3">
      <p className="text-sm font-semibold">Family members</p>
      <p className="mt-1 text-xs text-mist">Update names, sides, guest types, and notes.</p>
    </div>
    {family.guests.map((member) => <section className="rounded-2xl border border-line bg-white p-4" key={member.id}>
      <input name="guestId" type="hidden" value={member.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name"><input className={inputClass} defaultValue={member.firstName} name="firstName" required /></Field>
        <Field label="Side"><select className={inputClass} defaultValue={normalizedSide(member.side)} name="side">{sideOptions}</select></Field>
        <Field label="Guest type"><select className={inputClass} defaultValue={normalizedGuestType(member.ageBand)} name="ageBand">{guestTypeOptions}</select></Field>
        <Field label="Dietary or allergy notes"><input className={inputClass} defaultValue={member.dietary ?? ""} name="dietary" /></Field>
      </div>
      <div className="mt-3"><Field label="Notes"><textarea className={inputClass} defaultValue={member.notes ?? ""} name="notes" rows={2} /></Field></div>
    </section>)}
    <button className={buttonClass}>Save family</button>
  </form>;
}
