import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log("Setting up Supabase Storage...");

  const { data, error } = await supabase.storage.createBucket("verifications", {
    public: false,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    if (error.message === "Bucket already exists") {
      console.log("Bucket 'verifications' already exists.");
    } else {
      console.error("Error creating bucket:", error);
      process.exit(1);
    }
  } else {
    console.log("Bucket 'verifications' created successfully.");
  }
}

setupStorage();
