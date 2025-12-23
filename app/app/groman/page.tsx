export default function GromanLandingPage() {
    return (
      <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "24px" }}>
        <section style={{ maxWidth: 420, margin: "0 auto" }}>
          
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            A Memorial, Done For You
          </h1>
  
          <p style={{ color: "#aaa", marginBottom: 24 }}>
            Offered in partnership with Groman Mortuary
          </p>
  
          <div style={{ background: "#111", borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>What’s Included</h2>
            <ul style={{ color: "#ccc", lineHeight: 1.6 }}>
              <li>• 4”×6” Memorial Cards (QR enabled)</li>
              <li>• Large Memorial Poster</li>
              <li>• Digital Memorial Page</li>
              <li>• Slideshow Video</li>
              <li>• Permanent QR</li>
            </ul>
          </div>
  
          <div style={{ background: "#0a0a0a", borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>DIY vs DASH</h2>
            <p style={{ color: "#ccc", marginBottom: 8 }}>
              DIY: Canva, Staples, QR apps, pickups, stress.
            </p>
            <p style={{ color: "#7CFFB2" }}>
              DASH: Upload once. We handle everything.
            </p>
          </div>
  
          <button
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 999,
              background: "linear-gradient(90deg,#7CFFB2,#5AA9FF)",
              color: "#000",
              fontWeight: 700,
              fontSize: 16,
              border: "none"
            }}
          >
            Continue
          </button>
  
        </section>
      </main>
    );
  }