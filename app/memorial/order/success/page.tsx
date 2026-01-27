 "use client";

 export const dynamic = "force-dynamic";

 import { useEffect } from "react";
 import { useRouter, useSearchParams } from "next/navigation";

 export default function MemorialOrderSuccessRedirect() {
   const router = useRouter();
   const searchParams = useSearchParams();

   useEffect(() => {
     const qs = searchParams?.toString() || "";
     router.replace(qs ? `/order/success?${qs}` : "/order/success");
   }, [router, searchParams]);

   return null;
 }
