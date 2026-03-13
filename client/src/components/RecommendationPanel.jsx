export default function RecommendationPanel({ selectedArea, recommendedArea, insights, recommendation }) {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Best Launch Zone</p>
            <h3>{recommendation.headline}</h3>
          </div>
          <span className="score-pill">{recommendedArea.launchScore}/100</span>
        </div>

        <p className="panel-copy">{recommendedArea.notes}</p>

        <div className="reason-list">
          {recommendation.reasons.map((reason) => (
            <article key={reason} className="reason-item">
              <strong>Why it works</strong>
              <span>{reason}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Selected Area</p>
            <h3>{selectedArea.name}</h3>
          </div>
        </div>

        <div className="insight-list">
          {insights.map((insight) => (
            <article key={insight.title} className="insight-card">
              <span>{insight.title}</span>
              <strong>{insight.value}</strong>
              <small>{insight.detail}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
