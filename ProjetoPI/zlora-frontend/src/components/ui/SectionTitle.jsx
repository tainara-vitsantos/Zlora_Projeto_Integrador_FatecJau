export default function SectionTitle({ title, highlight, subtitle }) {
  return (
    <header className="section-title">
      <h2>
        {title} {highlight && <span>{highlight}</span>}
      </h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </header>
  );
}