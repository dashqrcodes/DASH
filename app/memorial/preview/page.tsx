"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemorialPreviewRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/memorial/card-front");
  }, [router]);

  return null;
}
