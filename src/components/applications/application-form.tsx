"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Application, ApplicationStatus, JobType } from "@prisma/client";
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
import {
  ALL_JOB_TYPES,
  ALL_STATUSES,
  JOB_TYPE_LABELS,
  mergeMilestones,
  milestonesFromStatus,
  STATUS_LABELS,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/analytics";
import type { ExtractedJob } from "@/lib/validations";
import {
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/lib/actions";
import { JobImport } from "@/components/applications/job-import";

type Props = {
  application?: Application;
  geminiConfigured?: boolean;
};

function emptyToValue(value?: string | null) {
  return value ?? "";
}

export function ApplicationForm({
  application,
  geminiConfigured = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ApplicationStatus>(
    application?.status ?? ApplicationStatus.WISHLIST
  );
  const [jobType, setJobType] = useState<JobType>(
    application?.jobType ?? JobType.INTERNSHIP
  );
  const [startYear, setStartYear] = useState(
    application?.startYear ? String(application.startYear) : ""
  );
  const [referral, setReferral] = useState(application?.referral ?? false);
  const [coverLetter, setCoverLetter] = useState(application?.coverLetter ?? false);
  const [company, setCompany] = useState(application?.company ?? "");
  const [jobTitle, setJobTitle] = useState(application?.jobTitle ?? "");
  const [location, setLocation] = useState(emptyToValue(application?.location));
  const [dateApplied, setDateApplied] = useState(
    toDateInputValue(application?.dateApplied)
  );
  const [salary, setSalary] = useState(emptyToValue(application?.salary));
  const [jobLink, setJobLink] = useState(emptyToValue(application?.jobLink));
  const [resumeVersion, setResumeVersion] = useState(
    emptyToValue(application?.resumeVersion)
  );
  const [interviewDate, setInterviewDate] = useState(
    toDateInputValue(application?.interviewDate)
  );
  const [deadline, setDeadline] = useState(toDateInputValue(application?.deadline));
  const [notes, setNotes] = useState(emptyToValue(application?.notes));
  const initialMilestones = mergeMilestones(
    application?.status ?? ApplicationStatus.WISHLIST,
    {
      interviewReached: application?.interviewReached,
      offerReceived: application?.offerReceived,
      responseReceived: application?.responseReceived,
      interviewDate: application?.interviewDate,
    }
  );
  const [interviewReached, setInterviewReached] = useState(
    initialMilestones.interviewReached
  );
  const [offerReceived, setOfferReceived] = useState(
    initialMilestones.offerReceived
  );
  const [responseReceived, setResponseReceived] = useState(
    initialMilestones.responseReceived
  );

  function applyStatus(next: ApplicationStatus) {
    setStatus(next);
    const implied = milestonesFromStatus(next);
    if (implied.interviewReached) setInterviewReached(true);
    if (implied.offerReceived) setOfferReceived(true);
    if (implied.responseReceived) setResponseReceived(true);
  }

  function applyImport(data: ExtractedJob) {
    if (data.company) setCompany(data.company);
    if (data.jobTitle) setJobTitle(data.jobTitle);
    if (data.location) setLocation(data.location);
    if (data.salary) setSalary(data.salary);
    if (data.jobLink) setJobLink(data.jobLink);
    if (data.deadline) setDeadline(data.deadline);
    if (data.jobType) setJobType(data.jobType);
    if (data.startYear) setStartYear(String(data.startYear));
    if (data.notes) {
      setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${data.notes}` : data.notes!));
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsedStartYear = startYear.trim() ? Number(startYear) : null;
    const payload = {
      company,
      jobTitle,
      location: location || null,
      dateApplied: dateApplied || null,
      status,
      jobType,
      startYear:
        parsedStartYear && Number.isFinite(parsedStartYear)
          ? parsedStartYear
          : null,
      salary: salary || null,
      referral,
      jobLink: jobLink || null,
      resumeVersion: resumeVersion || null,
      coverLetter,
      notes: notes || null,
      interviewDate: interviewDate || null,
      deadline: deadline || null,
      interviewReached,
      offerReceived,
      responseReceived,
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
      <JobImport enabled={geminiConfigured} onImported={applyImport} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company" htmlFor="company" required>
          <Input
            id="company"
            name="company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="Apple"
          />
        </Field>
        <Field label="Job Title" htmlFor="jobTitle" required>
          <Input
            id="jobTitle"
            name="jobTitle"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="Software Engineer Intern"
          />
        </Field>
        <Field label="Location" htmlFor="location">
          <Input
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="Cupertino, CA"
          />
        </Field>
        <OptionalDateField
          label="Date Applied"
          id="dateApplied"
          value={dateApplied}
          onChange={setDateApplied}
        />
        <Field label="Status" htmlFor="status">
          <Select
            value={status}
            onValueChange={(v) => v && applyStatus(v as ApplicationStatus)}
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
        <Field label="Type" htmlFor="jobType">
          <Select
            value={jobType}
            onValueChange={(v) => v && setJobType(v as JobType)}
          >
            <SelectTrigger id="jobType" className="h-10 w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_JOB_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {JOB_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Start year" htmlFor="startYear">
          <Input
            id="startYear"
            name="startYear"
            type="number"
            min={2000}
            max={2100}
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="e.g. 2027"
          />
        </Field>
        <Field label="Salary" htmlFor="salary">
          <Input
            id="salary"
            name="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="$50/hr or $120k"
          />
        </Field>
        <Field label="Job Link" htmlFor="jobLink">
          <Input
            id="jobLink"
            name="jobLink"
            type="url"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="https://..."
          />
        </Field>
        <Field label="Resume Version" htmlFor="resumeVersion">
          <Input
            id="resumeVersion"
            name="resumeVersion"
            value={resumeVersion}
            onChange={(e) => setResumeVersion(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="v3-swe"
          />
        </Field>
        <OptionalDateField
          label="Interview Date"
          id="interviewDate"
          value={interviewDate}
          onChange={(value) => {
            setInterviewDate(value);
            if (value) setInterviewReached(true);
          }}
          hint="Setting a date marks Reached interview"
        />
        <OptionalDateField
          label="Deadline"
          id="deadline"
          value={deadline}
          onChange={setDeadline}
        />
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

      <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
        <div>
          <p className="text-sm font-medium">Milestones</p>
          <p className="text-xs text-muted-foreground">
            Sticky — stay checked after a rejection so rates stay accurate. Auto-set
            from status or interview date; use OA / 역량검사 for post-resume tests
            (not interviews). Check manually for older apps if needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={interviewReached}
              onCheckedChange={(v) => setInterviewReached(Boolean(v))}
              disabled={
                milestonesFromStatus(status).interviewReached ||
                Boolean(interviewDate)
              }
            />
            Reached interview
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={offerReceived}
              onCheckedChange={(v) => setOfferReceived(Boolean(v))}
              disabled={milestonesFromStatus(status).offerReceived}
            />
            Received offer
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={responseReceived}
              onCheckedChange={(v) => setResponseReceived(Boolean(v))}
              disabled={milestonesFromStatus(status).responseReceived}
            />
            Got a response
          </label>
        </div>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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

function OptionalDateField({
  label,
  id,
  value,
  onChange,
  hint,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-muted-foreground">Optional</span>
      </div>
      <div className="flex gap-2">
        <Input
          id={id}
          name={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-xl"
        />
        {value ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-xl px-3"
            onClick={() => onChange("")}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
