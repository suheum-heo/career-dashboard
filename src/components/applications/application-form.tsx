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
import { useLocale } from "@/components/locale-provider";
import {
  ALL_JOB_TYPES,
  ALL_STATUSES,
  mergeMilestones,
  milestonesFromStatus,
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
  const { t } = useLocale();
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
        toast.error(t("applications.formError"));
        return;
      }

      toast.success(
        application ? t("applications.updated") : t("applications.created")
      );
      router.push("/applications");
      router.refresh();
    });
  }

  function onDelete() {
    if (!application) return;
    if (!confirm(t("applications.deleteConfirm"))) return;
    startTransition(async () => {
      await deleteApplication(application.id);
      toast.success(t("applications.deleted"));
      router.push("/applications");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <JobImport enabled={geminiConfigured} onImported={applyImport} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("applications.company")} htmlFor="company" required>
          <Input
            id="company"
            name="company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-10 rounded-xl"
            placeholder={t("applications.companyPlaceholder")}
          />
        </Field>
        <Field label={t("applications.jobTitle")} htmlFor="jobTitle" required>
          <Input
            id="jobTitle"
            name="jobTitle"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="h-10 rounded-xl"
            placeholder={t("applications.titlePlaceholder")}
          />
        </Field>
        <Field label={t("applications.location")} htmlFor="location">
          <Input
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 rounded-xl"
            placeholder={t("applications.locationPlaceholder")}
          />
        </Field>
        <OptionalDateField
          label={t("applications.dateApplied")}
          id="dateApplied"
          value={dateApplied}
          onChange={setDateApplied}
        />
        <Field label={t("applications.status")} htmlFor="status">
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
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("applications.type")} htmlFor="jobType">
          <Select
            value={jobType}
            onValueChange={(v) => v && setJobType(v as JobType)}
          >
            <SelectTrigger id="jobType" className="h-10 w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_JOB_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`jobType.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("applications.startYear")} htmlFor="startYear">
          <Input
            id="startYear"
            name="startYear"
            type="number"
            min={2000}
            max={2100}
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="h-10 rounded-xl"
            placeholder={t("applications.startYearPlaceholder")}
          />
        </Field>
        <Field label={t("applications.salary")} htmlFor="salary">
          <Input
            id="salary"
            name="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="h-10 rounded-xl"
            placeholder={t("applications.salaryPlaceholder")}
          />
        </Field>
        <Field label={t("applications.jobLink")} htmlFor="jobLink">
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
        <Field label={t("applications.resumeVersion")} htmlFor="resumeVersion">
          <Input
            id="resumeVersion"
            name="resumeVersion"
            value={resumeVersion}
            onChange={(e) => setResumeVersion(e.target.value)}
            className="h-10 rounded-xl"
            placeholder={t("applications.resumePlaceholder")}
          />
        </Field>
        <OptionalDateField
          label={t("applications.interviewDate")}
          id="interviewDate"
          value={interviewDate}
          onChange={(value) => {
            setInterviewDate(value);
            if (value) setInterviewReached(true);
          }}
          hint={t("applications.interviewDateHint")}
        />
        <OptionalDateField
          label={t("applications.deadline")}
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
          {t("applications.referral")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={coverLetter}
            onCheckedChange={(v) => setCoverLetter(Boolean(v))}
          />
          {t("applications.coverLetter")}
        </label>
      </div>

      <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
        <div>
          <p className="text-sm font-medium">{t("applications.milestones")}</p>
          <p className="text-xs text-muted-foreground">
            {t("applications.milestonesHint")}
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
            {t("applications.reachedInterview")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={offerReceived}
              onCheckedChange={(v) => setOfferReceived(Boolean(v))}
              disabled={milestonesFromStatus(status).offerReceived}
            />
            {t("applications.receivedOffer")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={responseReceived}
              onCheckedChange={(v) => setResponseReceived(Boolean(v))}
              disabled={milestonesFromStatus(status).responseReceived}
            />
            {t("applications.gotResponse")}
          </label>
        </div>
      </div>

      <Field label={t("applications.notes")} htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-28 rounded-xl"
          placeholder={t("applications.notesPlaceholder")}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending} className="h-10 rounded-xl px-5">
          {isPending
            ? t("common.saving")
            : application
              ? t("common.save")
              : t("common.create")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={() => router.back()}
        >
          {t("common.cancel")}
        </Button>
        {application ? (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto h-10 rounded-xl"
            disabled={isPending}
            onClick={onDelete}
          >
            {t("common.delete")}
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
  const { t } = useLocale();

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-muted-foreground">{t("common.optional")}</span>
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
            {t("common.clear")}
          </Button>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
