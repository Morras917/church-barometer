import { supabase } from "@/lib/supabase";
import BarometerClient from "@/components/BarometerClient";

export const revalidate = 0;

async function getFundraisingData() {
  const { data, error } = await supabase
    .from("fundraising")
    .select("*")
    .single();

  if (error || !data) {
    return { current: 0, goal: 50000, title: "St Peter's Church Organ Fund", currency: "R" };
  }
  return data;
}

export default async function Home() {
  const data = await getFundraisingData();
  return <BarometerClient initialData={data} />;
}
