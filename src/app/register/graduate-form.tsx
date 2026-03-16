"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MUST_SCHOOLS,
  KENYAN_COUNTIES,
  EMPLOYMENT_SECTORS,
  GRADUATION_YEARS,
} from "@/lib/must-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ── Zod schema ─────────────────────────────────────── */
const schema = z.object({
  // Step 1 — Personal
  fullName:          z.string().min(3, "Enter your full name"),
  regNumber:         z.string().min(4, "Enter your registration number"),
  email:             z.string().email("Enter a valid email address"),
  phone:             z.string().min(10, "Enter a valid phone number"),
  gender:            z.enum(["Male", "Female", "Prefer not to say"]),
  dob:               z.string().min(1, "Select your date of birth"),
  countyOfOrigin:    z.string().min(1, "Select county of origin"),
  currentCounty:     z.string().min(1, "Select current county"),
  nationalId:        z.string().min(7, "Enter your National ID / Passport number"),

  // Step 2 — Academic
  school:            z.string().min(1, "Select your school"),
  department:        z.string().min(1, "Select your department"),
  programme:         z.string().min(1, "Select your programme"),
  graduationYear:    z.string().min(1, "Select graduation year"),
  modeOfStudy:       z.enum(["Full-time", "Part-time", "Distance Learning"]),
  classOfDegree:     z.string().min(1, "Select class of degree"),
  thesisTitle:       z.string().optional(),
  supervisorName:    z.string().optional(),
  campus:            z.enum(["Main Campus (Nchiru)", "Meru Town Campus"]),

  // Step 3 — Employment
  employmentStatus:  z.enum([
    "Employed (Full-time)",
    "Employed (Part-time)",
    "Self-employed / Entrepreneur",
    "Internship / Attachment",
    "Further Studies",
    "Unemployed — Seeking",
    "Unemployed — Not Seeking",
  ]),
  employerName:      z.string().optional(),
  jobTitle:          z.string().optional(),
  sector:            z.string().optional(),
  employmentCounty:  z.string().optional(),
  monthsToEmploy:    z.string().optional(),
  salaryRange:       z.string().optional(),
  linkedIn:          z.string().optional(),

  // Step 4 — Skills
  skills:            z.array(z.string()).min(1, "Select at least one skill"),
  certifications:    z.string().optional(),
  challenges:        z.string().optional(),
  suggestions:       z.string().optional(),
  consent:           z.literal(true, { message: "You must consent to continue" }),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Personal Info", "Academic Details", "Employment", "Skills & Feedback"];

const SKILLS_LIST = [
  "Programming / Software Development",
  "Data Analysis & Statistics",
  "Project Management",
  "Research & Report Writing",
  "Laboratory Skills",
  "Entrepreneurship",
  "Communication & Presentation",
  "Agricultural Practices",
  "Engineering & Technical Drawing",
  "Financial Accounting",
  "Public Health & Epidemiology",
  "Nursing & Patient Care",
  "Teaching & Pedagogy",
  "GIS & Remote Sensing",
  "Networking & Cybersecurity",
  "Leadership & Team Management",
];

const SALARY_RANGES = [
  "Below KES 20,000",
  "KES 20,000 – 40,000",
  "KES 40,001 – 60,000",
  "KES 60,001 – 100,000",
  "KES 100,001 – 150,000",
  "Above KES 150,000",
  "Prefer not to say",
];

/* ── Reusable field wrapper ─────────────────────────── */
function Field({
  label, required, error, children, hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

/* ── Styled native select ───────────────────────────── */
function NativeSelect({
  value, onChange, children, placeholder, hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasError ? "border-destructive" : "border-input",
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

/* ── Main form component ────────────────────────────── */
export function GraduateForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { skills: [], consent: undefined as unknown as true },
    mode: "onChange",
  });

  const watchedSchool     = watch("school");
  const watchedDept       = watch("department");
  const watchedEmpStatus  = watch("employmentStatus");
  const watchedSkills     = watch("skills");

  const selectedSchool = MUST_SCHOOLS.find((s) => s.id === watchedSchool);
  const selectedDept   = selectedSchool?.departments.find((d) => d.id === watchedDept);

  // reset dept/programme when school changes
  useEffect(() => {
    setValue("department", "");
    setValue("programme", "");
  }, [watchedSchool, setValue]);

  // reset programme when dept changes
  useEffect(() => {
    setValue("programme", "");
  }, [watchedDept, setValue]);

  const isEmployed = watchedEmpStatus && !["Unemployed — Seeking", "Unemployed — Not Seeking", "Further Studies"].includes(watchedEmpStatus);

  /* Step field maps for partial validation */
  const stepFields: (keyof FormData)[][] = [
    ["fullName", "regNumber", "email", "phone", "gender", "dob", "countyOfOrigin", "currentCounty", "nationalId"],
    ["school", "department", "programme", "graduationYear", "modeOfStudy", "classOfDegree", "campus"],
    ["employmentStatus"],
    ["skills", "consent"],
  ];

  async function nextStep() {
    const valid = await trigger(stepFields[step] as (keyof FormData)[]);
    if (valid) setStep((s) => s + 1);
  }
  function prevStep() { setStep((s) => s - 1); }

  function onSubmit(data: FormData) {
    console.log("Graduate submission:", data);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40 text-center py-16">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-black text-green-800 dark:text-green-300">
            Thank you for submitting!
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Your information has been recorded. The MUST Career Services team
            will use your data to improve employability support for future
            graduates. You may receive a follow-up survey by email.
          </p>
          <Badge className="mt-2 bg-green-700 text-white px-4 py-1 text-sm">
            Submission Reference: MUST-{Date.now().toString(36).toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => { setSubmitted(false); setStep(0); }}
          >
            Submit Another Response
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Progress bar */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Step {step + 1} of {STEPS.length} —{" "}
            <span className="text-amber-600 dark:text-amber-400">{STEPS[step]}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.round(((step + 1) / STEPS.length) * 100)}% complete
          </p>
        </div>
        <Progress
          value={((step + 1) / STEPS.length) * 100}
          className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-green-600 [&>div]:to-amber-500"
        />
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                i <= step ? "bg-amber-500" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── STEP 1: Personal Information ── */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-sm font-black text-amber-700 dark:text-amber-400">1</span>
              Personal Information
            </CardTitle>
            <CardDescription>
              Your personal details are kept confidential and used only for graduate tracking purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" required error={errors.fullName?.message}>
              <Input
                placeholder="e.g. Jane Wanjiru Muthoni"
                {...register("fullName")}
                className={errors.fullName ? "border-destructive" : ""}
              />
            </Field>

            <Field
              label="Registration / Student Number"
              required
              error={errors.regNumber?.message}
              hint="As on your academic transcript (e.g. MUST/PG/123/2020)"
            >
              <Input
                placeholder="MUST/PG/123/2020"
                {...register("regNumber")}
                className={errors.regNumber ? "border-destructive" : ""}
              />
            </Field>

            <Field label="Email Address" required error={errors.email?.message}>
              <Input
                type="email"
                placeholder="jane@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
            </Field>

            <Field
              label="Phone Number"
              required
              error={errors.phone?.message}
              hint="Include country code e.g. +254712345678"
            >
              <Input
                type="tel"
                placeholder="+254 7XX XXX XXX"
                {...register("phone")}
                className={errors.phone ? "border-destructive" : ""}
              />
            </Field>

            <Field label="National ID / Passport No." required error={errors.nationalId?.message}>
              <Input
                placeholder="e.g. 12345678"
                {...register("nationalId")}
                className={errors.nationalId ? "border-destructive" : ""}
              />
            </Field>

            <Field label="Date of Birth" required error={errors.dob?.message}>
              <Input
                type="date"
                {...register("dob")}
                className={errors.dob ? "border-destructive" : ""}
              />
            </Field>

            <Field label="Gender" required error={errors.gender?.message} >
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4 pt-1"
                  >
                    {(["Male", "Female", "Prefer not to say"] as const).map((g) => (
                      <div key={g} className="flex items-center gap-2">
                        <RadioGroupItem value={g} id={`gender-${g}`} />
                        <Label htmlFor={`gender-${g}`} className="font-normal cursor-pointer">{g}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            <Field label="County of Origin" required error={errors.countyOfOrigin?.message}>
              <Controller
                name="countyOfOrigin"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="— Select county —"
                    hasError={!!errors.countyOfOrigin}
                  >
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </NativeSelect>
                )}
              />
            </Field>

            <Field label="Current County / Location" required error={errors.currentCounty?.message}>
              <Controller
                name="currentCounty"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="— Select county —"
                    hasError={!!errors.currentCounty}
                  >
                    <option value="Outside Kenya">Outside Kenya</option>
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </NativeSelect>
                )}
              />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2: Academic Details ── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-sm font-black text-amber-700 dark:text-amber-400">2</span>
              Academic Details
            </CardTitle>
            <CardDescription>
              Your academic information at Meru University of Science and Technology.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">

            <Field label="Campus" required error={errors.campus?.message}>
              <Controller
                name="campus"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4 pt-1"
                  >
                    {(["Main Campus (Nchiru)", "Meru Town Campus"] as const).map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <RadioGroupItem value={c} id={`campus-${c}`} />
                        <Label htmlFor={`campus-${c}`} className="font-normal cursor-pointer text-sm">{c}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            <Field label="School / Faculty" required error={errors.school?.message}>
              <Controller
                name="school"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="— Select your school —"
                    hasError={!!errors.school}
                  >
                    {MUST_SCHOOLS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </NativeSelect>
                )}
              />
            </Field>

            <Field label="Department" required error={errors.department?.message}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder={selectedSchool ? "— Select department —" : "— Select school first —"}
                    hasError={!!errors.department}
                  >
                    {selectedSchool?.departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </NativeSelect>
                )}
              />
            </Field>

            <Field label="Degree Programme" required error={errors.programme?.message}>
              <Controller
                name="programme"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder={selectedDept ? "— Select programme —" : "— Select department first —"}
                    hasError={!!errors.programme}
                  >
                    {selectedDept?.programmes.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </NativeSelect>
                )}
              />
            </Field>

            <Field label="Year of Graduation" required error={errors.graduationYear?.message}>
              <Controller
                name="graduationYear"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="— Select year —"
                    hasError={!!errors.graduationYear}
                  >
                    {GRADUATION_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </NativeSelect>
                )}
              />
            </Field>

            <Field label="Class of Degree / Grade" required error={errors.classOfDegree?.message}>
              <Controller
                name="classOfDegree"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="— Select class —"
                    hasError={!!errors.classOfDegree}
                  >
                    {[
                      "First Class Honours",
                      "Second Class Honours (Upper Division)",
                      "Second Class Honours (Lower Division)",
                      "Pass",
                      "Distinction (Masters/PhD)",
                      "Merit (Masters/PhD)",
                      "Pass (Masters/PhD)",
                      "Diploma — Credit",
                      "Diploma — Pass",
                    ].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </NativeSelect>
                )}
              />
            </Field>

            <Field label="Mode of Study" required error={errors.modeOfStudy?.message}>
              <Controller
                name="modeOfStudy"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4 pt-1"
                  >
                    {(["Full-time", "Part-time", "Distance Learning"] as const).map((m) => (
                      <div key={m} className="flex items-center gap-2">
                        <RadioGroupItem value={m} id={`mode-${m}`} />
                        <Label htmlFor={`mode-${m}`} className="font-normal cursor-pointer">{m}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field
                label="Research / Thesis Title"
                error={errors.thesisTitle?.message}
                hint="Applicable for postgraduate students. Leave blank if not applicable."
              >
                <Input
                  placeholder="e.g. Effect of Climate Change on Food Security in Meru County"
                  {...register("thesisTitle")}
                />
              </Field>
            </div>

            <Field
              label="Supervisor / Project Supervisor Name"
              error={errors.supervisorName?.message}
              hint="Optional — name of your final year project or thesis supervisor"
            >
              <Input
                placeholder="e.g. Dr. John Kamau"
                {...register("supervisorName")}
              />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3: Employment ── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-sm font-black text-amber-700 dark:text-amber-400">3</span>
              Employment Information
            </CardTitle>
            <CardDescription>
              Tell us about your current employment situation after graduation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Field label="Current Employment Status" required error={errors.employmentStatus?.message}>
                <Controller
                  name="employmentStatus"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {([
                        "Employed (Full-time)",
                        "Employed (Part-time)",
                        "Self-employed / Entrepreneur",
                        "Internship / Attachment",
                        "Further Studies",
                        "Unemployed — Seeking",
                        "Unemployed — Not Seeking",
                      ] as const).map((s) => (
                        <label
                          key={s}
                          htmlFor={`emp-${s}`}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-all",
                            field.value === s
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 font-medium text-amber-700 dark:text-amber-400"
                              : "border-border hover:border-amber-300 hover:bg-muted/40",
                          )}
                        >
                          <RadioGroup value={field.value} onValueChange={field.onChange}>
                            <RadioGroupItem value={s} id={`emp-${s}`} />
                          </RadioGroup>
                          {s}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </Field>
            </div>

            {isEmployed && (
              <>
                <Field label="Employer / Organisation Name" error={errors.employerName?.message}>
                  <Input
                    placeholder="e.g. Safaricom PLC"
                    {...register("employerName")}
                  />
                </Field>

                <Field label="Job Title / Position" error={errors.jobTitle?.message}>
                  <Input
                    placeholder="e.g. Software Engineer"
                    {...register("jobTitle")}
                  />
                </Field>

                <Field label="Industry / Sector" error={errors.sector?.message}>
                  <Controller
                    name="sector"
                    control={control}
                    render={({ field }) => (
                      <NativeSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="— Select sector —"
                      >
                        {EMPLOYMENT_SECTORS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </NativeSelect>
                    )}
                  />
                </Field>

                <Field label="County / Country of Work" error={errors.employmentCounty?.message}>
                  <Controller
                    name="employmentCounty"
                    control={control}
                    render={({ field }) => (
                      <NativeSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="— Select location —"
                      >
                        <option value="Outside Kenya">Outside Kenya</option>
                        {KENYAN_COUNTIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </NativeSelect>
                    )}
                  />
                </Field>

                <Field
                  label="Monthly Salary Range"
                  error={errors.salaryRange?.message}
                  hint="Approximate gross monthly salary (KES)"
                >
                  <Controller
                    name="salaryRange"
                    control={control}
                    render={({ field }) => (
                      <NativeSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="— Select range —"
                      >
                        {SALARY_RANGES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </NativeSelect>
                    )}
                  />
                </Field>

                <Field
                  label="Months to First Employment After Graduation"
                  error={errors.monthsToEmploy?.message}
                  hint="How many months after graduation did you get your first job?"
                >
                  <Controller
                    name="monthsToEmploy"
                    control={control}
                    render={({ field }) => (
                      <NativeSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="— Select —"
                      >
                        {[
                          "Already employed (internship converted)",
                          "Less than 1 month",
                          "1 – 3 months",
                          "4 – 6 months",
                          "7 – 12 months",
                          "More than 12 months",
                          "Still seeking",
                        ].map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </NativeSelect>
                    )}
                  />
                </Field>

                <Field
                  label="LinkedIn Profile URL"
                  error={errors.linkedIn?.message}
                  hint="Optional — helps employers connect with you"
                >
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    {...register("linkedIn")}
                  />
                </Field>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── STEP 4: Skills & Feedback ── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-sm font-black text-amber-700 dark:text-amber-400">4</span>
              Skills &amp; Feedback
            </CardTitle>
            <CardDescription>
              Help MUST improve curriculum and career support for future graduates.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">

            <Field label="Key Skills Acquired at MUST" required error={errors.skills?.message}>
              <p className="mb-3 text-xs text-muted-foreground">Select all that apply:</p>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {SKILLS_LIST.map((skill) => {
                      const checked = field.value?.includes(skill) ?? false;
                      return (
                        <label
                          key={skill}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-all",
                            checked
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 font-medium text-amber-700 dark:text-amber-400"
                              : "border-border hover:border-amber-300 hover:bg-muted/40",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v) {
                                field.onChange([...field.value, skill]);
                              } else {
                                field.onChange(field.value.filter((s) => s !== skill));
                              }
                            }}
                          />
                          {skill}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {watchedSkills?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {watchedSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s.split(" ")[0]}
                    </Badge>
                  ))}
                </div>
              )}
            </Field>

            <Field
              label="Additional Certifications / Professional Courses"
              error={errors.certifications?.message}
              hint="List any professional certifications earned after graduation (e.g. CPA, PMP, AWS, CISCO)"
            >
              <Textarea
                placeholder="e.g. Certified Public Accountant (CPA-K) — 2023&#10;AWS Solutions Architect — 2024"
                rows={3}
                {...register("certifications")}
              />
            </Field>

            <Field
              label="Challenges Faced in Your Job Search"
              error={errors.challenges?.message}
              hint="Your honest feedback helps us improve career support"
            >
              <Textarea
                placeholder="e.g. Lack of industry-specific experience, limited networking opportunities..."
                rows={4}
                {...register("challenges")}
              />
            </Field>

            <Field
              label="Suggestions to Improve Graduate Employability at MUST"
              error={errors.suggestions?.message}
            >
              <Textarea
                placeholder="e.g. More industry attachments, stronger ties with employers, updated labs..."
                rows={4}
                {...register("suggestions")}
              />
            </Field>

            {/* Consent */}
            <div className={cn(
              "rounded-xl border p-4",
              errors.consent ? "border-destructive bg-destructive/5" : "border-border bg-muted/30",
            )}>
              <Controller
                name="consent"
                control={control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(v) => field.onChange(v ? true : undefined)}
                      className="mt-0.5"
                    />
                    <div className="text-sm leading-relaxed text-foreground">
                      <span className="font-semibold">I consent</span> to Meru University of
                      Science and Technology (MUST) collecting and using my personal and
                      employment data for graduate employability research, career services
                      improvement, and institutional accreditation reporting. My data will
                      not be shared with third parties without my explicit permission.
                    </div>
                  </label>
                )}
              />
              {errors.consent && (
                <p className="mt-2 text-xs font-medium text-destructive">
                  {errors.consent.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={step === 0}
          className="gap-2"
        >
          ← Back
        </Button>

        <div className="flex items-center gap-2">
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="gap-2 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white"
            >
              Next Step →
            </Button>
          ) : (
            <Button
              type="submit"
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-8"
            >
              🎓 Submit My Details
            </Button>
          )}
        </div>
      </div>

      {/* Step dots */}
      <div className="mt-6 flex justify-center gap-2">
        {STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === step ? "w-6 bg-amber-500" : i < step ? "w-2 bg-green-500 cursor-pointer" : "w-2 bg-muted",
            )}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
    </form>
  );
}
