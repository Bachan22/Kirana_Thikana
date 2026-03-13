import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function RankingChart({ areas }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ranking</p>
          <h3>Top areas by launch score</h3>
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={areas}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#9db0bf" />
            <YAxis stroke="#9db0bf" />
            <Tooltip
              contentStyle={{
                background: "#10141b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px"
              }}
            />
            <Bar dataKey="launchScore" fill="#ff8b3d" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="ranking-list">
        {areas.map((area, index) => (
          <article key={area.id} className="ranking-item">
            <strong>
              #{index + 1} {area.name}
            </strong>
            <span>
              {area.launchScore}/100 - {area.totalOrders.toLocaleString()} orders - {area.activeRiders} riders
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
