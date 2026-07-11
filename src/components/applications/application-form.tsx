"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Application, ApplicationStatus } from "@prisma/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/analytics";
import { createApplication, updateApplication, deleteApplication } from "@/lib/actions";

type Props = {
  application?: Application;
};

export function ApplicationForm({ application }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ApplicationStatus>(
    application?.status ?? ApplicationStatus.WISHLIST
  );
  const [referral, setReferral] = useState(application?.referral ?? false);
  const [coverLetter, setCoverLetter] = useState(application?.coverLetter ?? false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      company: String(form.get("company") ?? ""),
      jobTitle: String(form.get("jobTitle") ?? ""),
      location: String(form.get("location") ?? "") || null,
      dateApplied: String(form.get("dateApplied") ?? "") || null,
      status,
      salary: String(form.get("salary") ?? "") || null,
      referral,
      jobLink: String(form.get("jobLink") ?? "") || null,
      resumeVersion: String(form.get("resumeVersion") ?? "") || null,
      coverLetter,
      notes: String(form.get("notes") ?? "") || null,
      interviewDate: String(form.get("interviewDate") ?? "") || null,
      deadline: String(form.get("deadline") ?? "") || null,
    };

    startTransition(async () => {
      const result = application
        ? await updateApplication(application.id, payload)
        : await createApplication(payload);

      if (result.error) {
        toast.error("Please check the form fields.");
        return;
      }

      toast.success(application ? "Application updated" : "Application created");
      router.push("/applications");
      router.refresh();
    });
  }

  function onDelete() {
    if (!application) return;
    if (!confirm("Delete this application?")) return;
    startTransition(async () => {
      await deleteApplication(application.id);
      toast.success("Application deleted");
      router.push("/applications");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company" htmlFor="company" required>
          <Input
            id="company"
            name="company"
            required
            defaultValue={application?.company ?? ""}
            className="h-10 rounded-xl"
            placeholder="Apple"
          />
        </Field>
        <Field label="Job Title" htmlFor="jobTitle" required>
          <Input
            id="jobTitle"
            name="jobTitle"
            required
            defaultValue={application?.jobTitle ?? ""}
            className="h-10 rounded-xl"
            placeholder="Software Engineer Intern"
          />
        </Field>
        <Field label="Location" htmlFor="location">
          <Input
            id="location"
            name="location"
            defaultValue={application?.location ?? ""}
            className="h-10 rounded-xl"
            placeholder="Cupertino, CA"
          />
        </Field>
        <Field label="Date Applied" htmlFor="dateApplied">
          <Input
            id="dateApplied"
            name="dateApplied"
            type="date"
            defaultValue={toDateInputValue(application?.dateApplied)}
            className="h-10 rounded-xl"
          />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select
            value={status}
            onValueChange={(v) => v && setStatus(v as ApplicationStatus)}
          >
            <SelectTrigger id="status" className="h-10 w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Salary" htmlFor="salary">
          <Input
            id="salary"
            name="salary"
            defaultValue={application?.salary ?? ""}
            className="h-10 rounded-xl"
            placeholder="$50/hr or $120k"
          />
        </Field>
        <Field label="Job Link" htmlFor="jobLink">
          <Input
            id="jobLink"
            name="jobLink"
            type="url"
            defaultValue={application?.jobLink ?? ""}
            className="h-10 rounded-xl"
            placeholder="https://..."
          />
        </Field>
        <Field label="Resume Version" htmlFor="resumeVersion">
          <Input
            id="resumeVersion"
            name="resumeVersion"
            defaultValue={application?.resumeVersion ?? ""}
            className="h-10 rounded-xl"
            placeholder="v3-swe"
          />
        </Field>
        <Field label="Interview Date" htmlFor="interviewDate">
          <Input
            id="interviewDate"
            name="interviewDate"
            type="date"
            defaultValue={toDateInputValue(application?.interviewDate)}
            className="h-10 rounded-xl"
          />
        </Field>
        <Field label="Deadline" htmlFor="deadline">
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={toDateInputValue(application?.deadline)}
            className="h-10 rounded-xl"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={referral}
            onCheckedChange={(v) => setReferral(Boolean(v))}
          />
          Referral
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={coverLetter}
            onCheckedChange={(v) => setCoverLetter(Boolean(v))}
          />
          Cover Letter
        </label>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={application?.notes ?? ""}
          className="min-h-28 rounded-xl"
          placeholder="Follow-ups, contacts, impressions…"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending} className="h-10 rounded-xl px-5">
          {isPending
            ? "Saving…"
            : application
              ? "Save changes"
              : "Create application"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        {application ? (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto h-10 rounded-xl"
            disabled={isPending}
            onClick={onDelete}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
