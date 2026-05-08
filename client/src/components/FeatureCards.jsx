export default function FeatureCards() {
  const items = [
    {
      title: "AI-Driven Insights",
      desc: "State-of-the-art models evaluate polygenic risk and drug response.",
      icon: "🤖"
    },
    {
      title: "Privacy First",
      desc: "Your data remains secure. Full control & encryption from day one.",
      icon: "🔐"
    },
    {
      title: "Actionable Reports",
      desc: "Clear, clinician-friendly summaries and recommendations.",
      icon: "📊"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((it) => (
        <div key={it.title} className="card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl2 bg-gp_primary/20 flex items-center justify-center text-2xl">
              {it.icon}
            </div>
            <h3 className="font-semibold text-lg">{it.title}</h3>
          </div>
          <p className="text-gp_muted mt-3">{it.desc}</p>
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-gp_primary/30 to-transparent" />
          <button className="mt-5 btn-ghost">Explore</button>
        </div>
      ))}
    </div>
  );
}
