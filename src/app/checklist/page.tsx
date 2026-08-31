import { addTask, updateTaskStatus } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { buttonClass, Card, Field, inputClass } from "@/components/card";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const { wedding } = await getAmericanCelebration();
  const tasks = await prisma.task.findMany({
    where: { weddingId: wedding.id },
    orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <AppShell>
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
            Planning tasks
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Add task</h2>
          <form action={addTask} className="mt-6 grid gap-4">
            <Field label="Title">
              <input className={inputClass} name="title" required />
            </Field>
            <Field label="Category">
              <input className={inputClass} name="category" />
            </Field>
            <Field label="Bucket">
              <input className={inputClass} name="bucket" placeholder="9_12_months" />
            </Field>
            <Field label="Due date">
              <input className={inputClass} name="dueDate" type="date" />
            </Field>
            <Field label="Assignee">
              <input className={inputClass} name="assignee" placeholder="Aayush or Grace" />
            </Field>
            <Field label="Chain">
              <input className={inputClass} name="chain" placeholder="marriage_license" />
            </Field>
            <Field label="Description">
              <textarea className={inputClass} name="description" rows={3} />
            </Field>
            <button className={buttonClass} type="submit">
              Add task
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-3xl font-semibold text-ink">Checklist</h2>
          <div className="mt-6 divide-y divide-ink/10">
            {tasks.map((task) => (
              <div className="grid gap-4 py-4 md:grid-cols-[1fr_auto]" key={task.id}>
                <div>
                  <p className="font-medium text-ink">{task.title}</p>
                  <p className="text-sm text-ink/55">
                    {task.category ?? "General"} | {task.assignee ?? "Unassigned"} |{" "}
                    {task.dueDate ? task.dueDate.toLocaleDateString("en-US") : "No date"}
                  </p>
                  {task.description ? <p className="mt-2 text-sm text-ink/65">{task.description}</p> : null}
                </div>
                <form action={updateTaskStatus} className="flex items-center gap-2">
                  <input name="taskId" type="hidden" value={task.id} />
                  <select className={`${inputClass} py-2`} name="status" defaultValue={task.status}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                    <option value="skipped">Skipped</option>
                  </select>
                  <button className="rounded-full bg-sage px-3 py-2 text-xs font-semibold text-white" type="submit">
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
