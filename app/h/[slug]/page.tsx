import { redirect } from "next/navigation";

/** Short URL redirect: /h/roger-gillis → /heaven/roger-gillis
 *  Shorter URL = simpler QR code = clearer print at production size */
export default async function ShortHeavenRedirect({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await (params as Promise<{ slug: string }>);
  redirect(`/heaven/${slug}`);
}
