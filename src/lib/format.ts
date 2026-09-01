export function formatCents(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

export function parseCents(value: FormDataEntryValue | null) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.round(numberValue * 100);
}

export function parseOptionalDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return new Date(trimmed);
}

export function requiredString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}

export function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

export function formatGuestSide(side: string | null | undefined) {
  if (side === "aayush" || side === "aayush_groom") return "Aayush";
  if (side === "grace" || side === "grace_bride") return "Grace";
  return "Shared";
}

export function formatGuestType(ageBand: string | null | undefined) {
  if (ageBand === "teenager") return "Teenager";
  if (ageBand === "kid" || ageBand === "child") return "Kid";
  if (ageBand === "toddler") return "Toddler (4 & under)";
  return "Adult";
}
