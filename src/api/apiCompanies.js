  import supabaseClient, { supabaseUrl } from "@/utils/supabase";

  // Fetch Companies
  export async function getCompanies(token) {
    const supabase = await supabaseClient(token);
    const { data, error } = await supabase.from("companies").select("*");

    if (error) {
      console.error("Error fetching Companies:", error);
      return null;
    }

    return data;
  }

  // Add Company
  export async function addNewCompany(token, _, companyData) {
    const supabase = await supabaseClient(token);

    // Generate unique file name
    const random = Math.floor(Math.random() * 90000);
    const fileName = `logo-${random}-${companyData.name.replace(/\s+/g, "-")}`;

    // Upload to Supabase storage
    const { error: storageError } = await supabase.storage
      .from("company-logo")
      .upload(fileName, companyData.logo, {
        contentType: companyData.logo?.type || "image/jpeg",
        upsert: false,
      });

    if (storageError) {
      console.error("Storage Error:", storageError);
      throw new Error("Error uploading Company Logo");
    }

    const logo_url = `${supabaseUrl}/storage/v1/object/public/company-logo/${fileName}`;

    // Insert into companies table
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          name: companyData.name,
          logo_url: logo_url,
        },
      ])
      .select();

    if (error) {
      console.error("Insert Error:", error);
      throw new Error("Error submitting Company");
    }

    return data;
  }
