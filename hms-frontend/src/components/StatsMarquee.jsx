export default function StatsMarquee() {
  const stats = [
    { number: '10,000+', label: 'Patients Served' },
    { number: '50+', label: 'Specialist Doctors' },
    { number: '15', label: 'Departments' },
    { number: '24/7', label: 'Emergency Care' },
    { number: 'NABH', label: 'Accredited' },
  ];

  const StatItem = ({ number, label }) => (
    <div className="flex items-center gap-8 whitespace-nowrap shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl sm:text-3xl font-heading font-bold text-white">{number}</span>
        <span className="text-sm sm:text-base text-white/80 font-medium">{label}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
    </div>
  );

  return (
    <section
      id="stats-marquee"
      className="relative bg-gradient-to-r from-navy-dark via-navy to-navy-dark py-5 sm:py-6 overflow-hidden"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative flex overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee">
          {[...stats, ...stats, ...stats, ...stats].map((stat, i) => (
            <StatItem key={i} number={stat.number} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
