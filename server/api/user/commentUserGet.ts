import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // console.log("body", body);
  const supabase = serverSupabaseClient(event);

  const data = await Promise.all(
    body.map(async (item) => {
      let { data: users } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", item.userId);
      item.username = users[0].username;
      return item;
    })
  );

  return data;
});
