const CURATORS = [
  { initials: "AR", name: "Dr. A. Reed", title: "Relationship Psychologist" },
  { initials: "MT", name: "M. Thomas", title: "Attachment Specialist" },
  { initials: "SK", name: "S. Kim", title: "Mindfulness Coach" },
];

export function MeetCurators() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
        Meet Our Curators
      </p>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {CURATORS.map((c) => (
          <div key={c.name} className="flex flex-col items-center flex-shrink-0 w-20">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
              <span className="text-white text-sm font-bold">{c.initials}</span>
            </div>
            <p className="text-sm text-gray-900 font-medium text-center leading-tight">
              {c.name}
            </p>
            <p className="text-xs text-gray-500 text-center mt-0.5 leading-tight">{c.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
