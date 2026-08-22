export default function HeroDataRail() {
  const items = [
    { label: "LIVE", value: "24/7" },
    { label: "MATCHES", value: "1,284" },
    { label: "LEAGUES", value: "42" },
    { label: "STATUS", value: "ONLINE" },
  ];

  return (
    <div
      className="flex items-stretch border-t border-border-subtle"
      data-hero-data-rail
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex-1 flex flex-col items-center sm:items-start gap-1 px-5 sm:px-6 py-4 sm:border-r border-border-subtle last:border-r-0"
        >
          <span className="technical-label">{item.label}</span>
          <span className="data-number text-base sm:text-lg font-medium text-text-primary">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
