import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const initialCategories = [
  { name: "Single Room", display_order: 1 },
  { name: "Chamber and Hall", display_order: 2 },
  { name: "1 Bedroom", display_order: 3 },
  { name: "2 Bedroom", display_order: 4 },
  { name: "3 Bedroom", display_order: 5 },
  { name: "4 Bedroom and Above", display_order: 6 },
  { name: "Self Contained Apartment", display_order: 7 },
  { name: "Hostel Room", display_order: 8 },
  { name: "Short Stay / Airbnb", display_order: 9 },
  { name: "Shop", display_order: 10 },
  { name: "Office Space", display_order: 11 },
  { name: "Warehouse", display_order: 12 },
  { name: "Land", display_order: 13 },
  { name: "Other", display_order: 14 },
];

async function seedCategories() {
  console.log("Seeding categories...");

  for (const category of initialCategories) {
    const { error } = await supabase
      .from("categories")
      .upsert({ name: category.name, display_order: category.display_order }, { onConflict: "name" });

    if (error) {
      console.error(`Error seeding category ${category.name}:`, error);
    } else {
      console.log(`Seeded category: ${category.name}`);
    }
  }

  console.log("Seeding complete.");
}

seedCategories();
