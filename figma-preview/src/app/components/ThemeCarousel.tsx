type ThemeCardProps = {
  title: string;
  subtext: string;
  background: string;
};

const cards: ThemeCardProps[] = [
  {
    title: 'LOVE',
    subtext: 'Wedding • Anniversary • Us',
    background: 'url(/images/01BBAACB-8185-40DA-9A17-5E18E5635C6B_4_5005_c.jpeg) center/cover no-repeat',
  },
  {
    title: 'LIFE',
    subtext: 'Family • Kids • Graduation',
    background: 'url(/images/09837CE2-592D-4CA6-A504-2363825C1AA2_4_5005_c.jpeg) center/cover no-repeat',
  },
  {
    title: 'FOREVER',
    subtext: 'Memorial • Tribute • Legacy',
    background: 'url(/images/109D44F1-78DE-45C3-82DE-6577BAEEEA4E_1_102_o.jpeg) center/cover no-repeat',
  },
];

function ThemeCard({ title, subtext, background }: ThemeCardProps) {
  return (
    <div className="theme-card">
      <div className="theme-card__image" style={{ background }} />
      <div className="theme-card__label">
        <span>{title}</span>
      </div>
      <p className="muted">{subtext}</p>
    </div>
  );
}

export default function ThemeCarousel() {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Themes</h2>
      </div>

      <div className="carousel" aria-label="Theme cards">
        {cards.map((card) => (
          <ThemeCard key={card.title} {...card} />
        ))}
      </div>

      <div className="dots">
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </section>
  );
}

