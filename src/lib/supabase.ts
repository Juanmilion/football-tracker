import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tgmihxzpwuttatkanyhc.supabase.co";
const supabaseKey = "sb_publishable_95_A-laGpCZS_olZoZsAAQ_MP1L-PJL";

export const supabase = createClient(supabaseUrl, supabaseKey);