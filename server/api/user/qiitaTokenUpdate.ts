import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  const client = serverSupabaseClient(event);
  const { data } = await client
    .from("profiles")
    .update({ qiitaToken: body.qiitaToken })
    .eq("id", body.userId);
  return data;
});

// import { serverSupabaseClient } from "#supabase/server";
// interface BodySchema {
//   userId: string;
//   qiitaToken: string;
// }
// export default defineEventHandler(async (event) => {
//   const body = await readBody<BodySchema>(event);
//   console.log("body", body);
//   const client = serverSupabaseClient(event);
//   const { data } = await client
//     .from("profiles")
//     .update({ qiitaToken: body.qiitaToken })
//     .eq("id", body.userId);
//   return data;
// });
