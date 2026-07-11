import { PrismaClient, ApplicationStatus } from "@prisma/client";
import { subDays, subMonths, addDays } from "date-fns";

const prisma = new PrismaClient();

const companies = [
  { company: "Apple", jobTitle: "Software Engineer Intern", location: "Cupertino, CA" },
  { company: "Google", jobTitle: "SWE Intern, Cloud", location: "Mountain View, CA" },
  { company: "Meta", jobTitle: "Software Engineer Intern", location: "Menlo Park, CA" },
  { company: "Amazon", jobTitle: "SDE Intern", location: "Seattle, WA" },
  { company: "Microsoft", jobTitle: "Software Engineer Intern", location: "Redmond, WA" },
  { company: "Stripe", jobTitle: "Software Engineer Intern", location: "San Francisco, CA" },
  { company: "Airbnb", jobTitle: "Software Engineer Intern", location: "San Francisco, CA" },
  { company: "Netflix", jobTitle: "Software Engineer Intern", location: "Los Gatos, CA" },
  { company: "Uber", jobTitle: "Software Engineer Intern", location: "San Francisco, CA" },
  { company: "LinkedIn", jobTitle: "Software Engineer Intern", location: "Sunnyvale, CA" },
  { company: "Salesforce", jobTitle: "Software Engineer Intern", location: "San Francisco, CA" },
  { company: "Adobe", jobTitle: "Software Engineer Intern", location: "San Jose, CA" },
  { company: "NVIDIA", jobTitle: "Software Engineer Intern", location: "Santa Clara, CA" },
  { company: "OpenAI", jobTitle: "Software Engineer Intern", location: "San Francisco, CA" },
  { company: "Anthropic", jobTitle: "Software Engineer Intern", location: "San Francisco, CA" },
  { company: "Databricks", jobTitle: "Software Engineer Intern", location: "Mountain View, CA" },
  { company: "Snowflake", jobTitle: "Software Engineer Intern", location: "Remote" },
  { company: "Figma", jobTitle: "Software Engineer Intern", location: "San Francisco, CA" },
  { company: "Notion", jobTitle: "Software Engineer Intern", location: "New York, NY" },
  { company: "Spotify", jobTitle: "Backend Engineer Intern", location: "New York, NY" },
  { company: "Jane Street", jobTitle: "Software Engineer Intern", location: "New York, NY" },
  { company: "Two Sigma", jobTitle: "Software Engineer Intern", location: "New York, NY" },
  { company: "Bloomberg", jobTitle: "Software Engineer Intern", location: "New York, NY" },
  { company: "Capital One", jobTitle: "Technology Intern", location: "McLean, VA" },
  { company: "JPMorgan Chase", jobTitle: "Software Engineer Intern", location: "New York, NY" },
];

const statuses: ApplicationStatus[] = [
  ApplicationStatus.WISHLIST,
  ApplicationStatus.APPLIED,
  ApplicationStatus.APPLIED,
  ApplicationStatus.APPLIED,
  ApplicationStatus.OA,
  ApplicationStatus.OA,
  ApplicationStatus.RECRUITER_SCREEN,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.FINAL_ROUND,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.GHOSTED,
  ApplicationStatus.WITHDRAWN,
];

async function main() {
  await prisma.application.deleteMany();

  const now = new Date();

  const data = companies.map((c, i) => {
    const status = statuses[i % statuses.length];
    const daysAgo = (i * 7) % 120;
    const dateApplied =
      status === ApplicationStatus.WISHLIST ? null : subDays(now, daysAgo);
    const interviewStatuses: ApplicationStatus[] = [
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.FINAL_ROUND,
      ApplicationStatus.OFFER,
      ApplicationStatus.RECRUITER_SCREEN,
    ];
    const interviewDate = interviewStatuses.includes(status)
      ? addDays(now, (i % 14) - 3)
      : null;

    return {
      ...c,
      status,
      dateApplied,
      interviewDate,
      referral: i % 4 === 0,
      salary: i % 3 === 0 ? "$50/hr" : i % 3 === 1 ? "$45/hr" : null,
      jobLink: `https://careers.example.com/${c.company.toLowerCase().replace(/\s+/g, "-")}`,
      resumeVersion: i % 2 === 0 ? "v3-swe" : "v2-general",
      coverLetter: i % 5 === 0,
      notes:
        i % 3 === 0
          ? "Reached out via LinkedIn. Strong culture fit."
          : i % 3 === 1
            ? "Referral from alumni. Follow up next week."
            : null,
      deadline:
        status === ApplicationStatus.WISHLIST ? addDays(now, 10 + (i % 20)) : null,
    };
  });

  // Extra historical applications for charts
  const historical = Array.from({ length: 20 }).map((_, i) => {
    const base = companies[i % companies.length];
    return {
      company: base.company,
      jobTitle: "New Grad Software Engineer",
      location: base.location,
      status: [
        ApplicationStatus.APPLIED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.GHOSTED,
        ApplicationStatus.OFFER,
      ][i % 4],
      dateApplied: subMonths(now, 1 + (i % 6)),
      referral: i % 5 === 0,
      salary: null,
      jobLink: null,
      resumeVersion: "v1",
      coverLetter: false,
      notes: null,
      interviewDate: null,
      deadline: null,
    };
  });

  await prisma.application.createMany({ data: [...data, ...historical] });
  console.log(`Seeded ${data.length + historical.length} applications`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
