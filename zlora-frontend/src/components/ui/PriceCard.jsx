export default function PriceCard({
  label,
  monthly,
  old,
  total,
  popular,
  features = [],
  onSelect,
}) {
  return (
    <article className={`card pricing ${popular ? 'popular' : ''}`}>
      {popular && <div className="ribbon">Popular</div>}

      <div className="card-head">
        <small>{label}</small>
        <span className="price">
          <sub>R$</sub> {monthly}
          <sub>/mês</sub>
        </span>
        {old && (
          <del>
            <span className="price-old">R$ {old}/mês</span>
          </del>
        )}
        {total && <p className="price-total">Total: R$ {total}</p>}
      </div>

      <div className="card-body">
        <ul className="plan-features">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <button
          type="button"
          className={popular ? 'btn btn-primary btn-block' : 'btn btn-ghost btn-block'}
          onClick={onSelect}
        >
          Contratar plano
        </button>
      </div>
    </article>
  );
}