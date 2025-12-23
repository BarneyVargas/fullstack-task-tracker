// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export default async function handler(req, res) {
//   if (req.method === "GET") {
//     const { data, error } = await supabase
//       .from("tasks")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (error) return res.status(500).json(error);
//     return res.status(200).json(data);
//   }

//   if (req.method === "POST") {
//     const { title } = req.body;
//     const { data, error } = await supabase
//       .from("tasks")
//       .insert([{ title }])
//       .select();
//     if (error) return res.status(500).json(error);
//     return res.status(201).json(data[0]);
//   }

//   if (req.method === "PUT") {
//     const { id, completed } = req.body;
//     const { error } = await supabase
//       .from("tasks")
//       .update({ completed })
//       .eq("id", id);
//     if (error) return res.status(500).json(error);
//     return res.status(200).json({ success: true });
//   }

//   if (req.method === "DELETE") {
//     const { id } = req.body;
//     const { error } = await supabase.from("tasks").delete().eq("id", id);
//     if (error) return res.status(500).json(error);
//     return res.status(200).json({ success: true });
//   }

//   res.status(405).end();
// }
