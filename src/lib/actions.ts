"use server";

import { supabase } from "@/lib/supabase";
import { MUST_SCHOOLS } from "@/lib/must-data";

export type GraduatePayload = {
  full_name: string;
  student_number?: string;
  email?: string;
  phone?: string;
  campus: string;
  school: string;       // school id (e.g. "sci")
  department: string;   // department id (e.g. "cs")
  programme: string;    // programme name string from the form
  graduation_year: string;
  employment_status: string;
  employer_name?: string;
  job_title?: string;
  sector?: string;
  employment_county?: string;
  months_to_employ?: string;
  linkedin_url?: string;
};

export type SubmitResult =
  | { success: true; id: number }
  | { success: false; error: string };

export async function submitGraduate(payload: GraduatePayload): Promise<SubmitResult> {
  try {
    // Resolve human-readable names from the static data
    const school = MUST_SCHOOLS.find((s) => s.id === payload.school);
    if (!school) return { success: false, error: "Invalid school selection." };

    const department = school.departments.find((d) => d.id === payload.department);
    if (!department) return { success: false, error: "Invalid department selection." };

    if (!department.programmes.includes(payload.programme as never)) {
      return { success: false, error: "Invalid programme selection." };
    }

    // Look up programme_id from the DB
    const { data: prog, error: progErr } = await supabase
      .from("programmes")
      .select("id")
      .eq("department_id", payload.department)
      .eq("name", payload.programme)
      .single();

    if (progErr || !prog) {
      return { success: false, error: "Could not resolve programme. Please try again." };
    }

    // Insert the graduate record
    const { data, error } = await supabase
      .from("graduates")
      .insert({
        full_name:         payload.full_name,
        student_number:    payload.student_number || null,
        email:             payload.email || null,
        phone:             payload.phone || null,
        campus:            payload.campus,
        school_id:         payload.school,
        department_id:     payload.department,
        programme_id:      prog.id,
        graduation_year:   parseInt(payload.graduation_year, 10),
        employment_status: payload.employment_status,
        employer_name:     payload.employer_name || null,
        job_title:         payload.job_title || null,
        sector:            payload.sector || null,
        employment_county: payload.employment_county || null,
        months_to_employ:  payload.months_to_employ || null,
        linkedin_url:      payload.linkedin_url || null,
        school_name:       school.name,
        department_name:   department.name,
        programme_name:    payload.programme,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error("submitGraduate unexpected error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
