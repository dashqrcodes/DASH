const VIDEO_SRC =
  'https://stream.mux.com/A00YNw01Uu47WfC5PTnbPXd966BKjguU00uQr2rlFKrEX/high.mp4';

export default function Hero() {
  return (
    <section className="section hero">
      <div className="hero-video" role="presentation">
        <video
          className="hero-video__media"
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="hero-video__overlay" />
      </div>

      <div className="hero-text">
        <h1>Timeless Transparency™</h1>
        <p className="muted">
          The QR code unlocks memories. Love. Life. Forever.
        </p>
      </div>
    </section>
  );
}

