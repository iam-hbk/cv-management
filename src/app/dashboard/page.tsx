import { Button } from "@/components/ui/button";
import { CVCard } from "@/components/dashboard/cv-card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { type CV } from "@/types/cv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCVs } from "@/lib/cv";

// Temporary mock data until we have a database
const mockCVs: CV[] = [
  {
    id: "1",
    title: "Senior Frontend Developer CV",
    createdAt: new Date("2024-03-19"),
    createdBy: {
      name: "John Doe",
      email: "john@example.com",
    },
    isAiAssisted: true,
    status: "completed",
    executiveSummary:
      "Senior Frontend Developer with 8+ years of experience building scalable web applications...",
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "1234567890",
      profession: "Frontend Developer",
      location: "London, UK",
      gender: "male",
      availability: "2 weeks notice",
      nationality: "British",
      currentSalary: 85000,
      expectedSalary: 95000,
      driversLicense: true,
      idNumber: "AB123456C",
    },
    workHistory: [
      {
        company: "Tech Corp",
        position: "Senior Frontend Developer",
        startDate: new Date("2020-01-01"),
        endDate: null,
        current: true,
        duties: [
          "Lead a team of 5 frontend developers",
          "Architect and implement scalable React applications",
          "Mentor junior developers",
          "Implement CI/CD pipelines",
        ],
        reasonForLeaving: "Seeking new challenges",
      },
    ],
    education: [
      {
        institution: "University of Technology",
        qualification: "BSc Computer Science",
        completionDate: new Date("2016-06-15").getFullYear(),
        completed: true,
      },
    ],
    skills: {
      computerSkills: [
        "React",
        "TypeScript",
        "Next.js",
        "TailwindCSS",
        "GraphQL",
        "Jest",
        "CI/CD",
      ],
      otherSkills: ["Team Leadership", "Mentoring", "Agile Methodologies"],
      skillsMatrix: [
        {
          skill: "React",
          yearsExperience: 8,
          proficiency: "Expert",
          lastUsed: 2024,
        },
        {
          skill: "TypeScript",
          yearsExperience: 6,
          proficiency: "Expert",
          lastUsed: 2024,
        },
        // Add more skill matrix entries as needed
      ],
    },
  },
  {
    id: "2",
    title: "Product Manager Application",
    createdAt: new Date("2024-03-15"),
    createdBy: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    isAiAssisted: false,
    status: "draft",
    executiveSummary:
      "Product manager with 5+ years experience in agile environments...",
    personalInfo: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "0987654321",
      profession: "Product Manager",
      location: "Manchester, UK",
      gender: "female",
      availability: "Immediate",
      nationality: "British",
      currentSalary: 70000,
      expectedSalary: 85000,
      driversLicense: true,
      idNumber: "XY789101Z",
    },
    workHistory: [
      {
        company: "Product House",
        position: "Product Manager",
        startDate: new Date("2021-03-01"),
        endDate: null,
        current: true,
        duties: ["Product strategy", "Stakeholder management"],
        reasonForLeaving: "Company restructuring",
      },
    ],
    education: [
      {
        institution: "Business School",
        qualification: "MBA",
        completionDate: new Date("2020-06-15").getFullYear(),
        completed: true,
      },
    ],
    skills: {
      computerSkills: [
        "JIRA",
        "Confluence",
        "Excel",
        "Product Analytics Tools",
      ],
      otherSkills: [
        "Product Strategy",
        "Agile",
        "User Research",
        "Data Analysis",
      ],
      skillsMatrix: [
        {
          skill: "Product Management",
          yearsExperience: 5,
          proficiency: "Advanced",
          lastUsed: 2024,
        },
        // Add more skill matrix entries as needed
      ],
    },
  },
  {
    id: "3",
    title: "UX Designer Portfolio",
    createdAt: new Date("2024-03-10"),
    createdBy: {
      name: "Sarah Wilson",
      email: "sarah@example.com",
    },
    isAiAssisted: true,
    status: "completed",
    executiveSummary:
      "Creative UX Designer with a passion for user-centered design...",
    personalInfo: {
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah@example.com",
      phone: "0123456789",
      profession: "UX Designer",
      location: "Bristol, UK",
      gender: "female",
      availability: "1 month notice",
      nationality: "British",
      currentSalary: 55000,
      expectedSalary: 65000,
      driversLicense: false,
      idNumber: "PQ987654R",
    },
    workHistory: [
      {
        company: "Design Studio",
        position: "UX Designer",
        startDate: new Date("2022-01-01"),
        endDate: null,
        current: true,
        duties: ["User research", "Wireframing", "Prototyping"],
        reasonForLeaving: "Career growth",
      },
    ],
    education: [
      {
        institution: "Design Institute",
        qualification: "BA Design",
        completionDate: new Date("2021-06-15").getFullYear(),
        completed: true,
      },
    ],
    skills: {
      computerSkills: ["Figma", "User Research", "Prototyping", "UI Design"],
      otherSkills: [],
      skillsMatrix: [],
    },
  },
  {
    id: "4",
    title: "Backend Developer CV",
    createdAt: new Date("2024-03-05"),
    createdBy: {
      name: "Mike Johnson",
      email: "mike@example.com",
    },
    isAiAssisted: false,
    status: "completed",
    executiveSummary: "Backend developer specializing in Node.js and Python...",
    personalInfo: {
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@example.com",
      phone: "0987654321",
      profession: "Backend Developer",
      location: "Edinburgh, UK",
      gender: "male",
      availability: "3 months notice",
      nationality: "British",
      currentSalary: 65000,
      expectedSalary: 75000,
      driversLicense: true,
      idNumber: "CD654321E",
    },
    workHistory: [
      {
        company: "Tech Solutions",
        position: "Backend Developer",
        startDate: new Date("2021-06-01"),
        endDate: null,
        current: true,
        duties: ["API development", "Database optimization"],
        reasonForLeaving: "Seeking remote opportunities",
      },
    ],
    education: [
      {
        institution: "Tech University",
        qualification: "MSc Software Engineering",
        completionDate: new Date("2021-05-15").getFullYear(),
        completed: true,
      },
    ],
    skills: {
      computerSkills: ["Node.js", "Python", "PostgreSQL", "Docker"],
      otherSkills: [],
      skillsMatrix: [],
    },
  },
];

export default async function Dashboard() {
  // Get CVs from database
  const dbCVs = await getCVs();

  // Combine real and mock data
  const allCVs = [...dbCVs, ...mockCVs];

  // Sort CVs by date and separate the most recent
  const sortedCVs = allCVs.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const [mostRecent, ...otherCVs] = sortedCVs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recent CVs</h1>
        <Link href="/dashboard/curriculum-vitae/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New CV
          </Button>
        </Link>
      </div>

      {mostRecent && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Most Recent CV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <CVCard cv={mostRecent} />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {mostRecent.executiveSummary}
                </p>
                <div>
                  <h3 className="mb-2 font-semibold">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...mostRecent.skills.computerSkills,
                      ...mostRecent.skills.otherSkills,
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {otherCVs.map((cv) => (
          <CVCard key={cv.id} cv={cv} />
        ))}
      </div>

      {allCVs.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed">
          <p className="text-muted-foreground">No CVs created yet</p>
          <Link href="/dashboard/curriculum-vitae/new">
            <Button variant="link" className="mt-2">
              Create your first CV
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
