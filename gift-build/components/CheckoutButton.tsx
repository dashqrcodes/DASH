"use client";

import { useState } from "react";

export default function CheckoutButton({ profileUrl }: { profileUrl: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-black text-white rounded-xl px-6 py-3 text-lg font-semibold mt-8"
      disabled={loading}
    >
      {loading ? "Processing..." : "Buy Now – $199"}
    </button>
  );
}

