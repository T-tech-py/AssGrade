type SettingsProfileCardProps = {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    school: string;
    course: string;
    level: string;
    location: string;
    bio: string;
  };
  isDirty: boolean;
  isSaving: boolean;
  onChange: (field: 'fullName' | 'phone' | 'school' | 'course' | 'level' | 'location' | 'bio', value: string) => void;
  onSave: () => Promise<void>;
  eyebrow?: string;
  description?: string;
  emailHelperText?: string;
};

export function SettingsProfileCard({
  profile,
  isDirty,
  isSaving,
  onChange,
  onSave,
  eyebrow = 'Profile',
  description = 'Keep your academic and contact details current so your readiness profile and certificates stay accurate.',
  emailHelperText = 'Email address changes will be added in a later account-security flow.',
}: SettingsProfileCardProps) {
  return (
    <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            {eyebrow}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={!isDirty || isSaving}
          className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : isDirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[var(--dashboard-accent-soft)] text-lg font-semibold text-[var(--dashboard-accent-foreground)]">
          {profile.fullName
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase()}
        </div>
        <div>
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
            {profile.fullName}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">
            Your email stays fixed here for now while we keep account identity changes behind the auth flow.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">Full name</span>
          <input
            value={profile.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--dashboard-text)] outline-none"
          />
        </label>
        <div className="dashboard-soft-tile rounded-[1.15rem] border border-[var(--dashboard-panel-border)] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Email</p>
          <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{profile.email}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--dashboard-muted)]">{emailHelperText}</p>
        </div>
        {[
          ['phone', 'Phone', profile.phone],
          ['school', 'School', profile.school],
          ['course', 'Course', profile.course],
          ['level', 'Level', profile.level],
          ['location', 'Location', profile.location],
        ].map(([field, label, value]) => (
          <label key={field} className="block">
            <span className="text-sm font-semibold text-[var(--dashboard-text)]">{label}</span>
            <input
              type={field === 'phone' ? 'tel' : 'text'}
              inputMode={field === 'phone' ? 'tel' : undefined}
              autoComplete={field === 'phone' ? 'tel' : undefined}
              value={value}
              onChange={(event) =>
                onChange(field as 'phone' | 'school' | 'course' | 'level' | 'location', event.target.value)
              }
              className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--dashboard-text)] outline-none"
            />
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">Bio</span>
          <textarea
            value={profile.bio}
            onChange={(event) => onChange('bio', event.target.value)}
            className="dashboard-soft-tile mt-2 min-h-[120px] w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
          />
        </label>
      </div>
    </div>
  );
}
