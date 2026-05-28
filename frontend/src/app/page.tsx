import { Footer } from '@/components/landing/footer';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { FeatureCard } from '@/components/landing/feature-card';
import { FinalCta } from '@/components/landing/final-cta';
import { MotionSection } from '@/components/landing/motion-section';
import { SectionHeading } from '@/components/landing/section-heading';
import { StepCard } from '@/components/landing/step-card';

const features = [
  {
    title: 'Multi-field Assessments',
    description: 'Evaluate graduate readiness across Law, Engineering, Tech, and other disciplines with structured assessments.',
    icon: 'assessment',
  },
  {
    title: 'Secure Online Exams',
    description: 'Protect assessment integrity with proctoring signals, anti-cheating controls, and trusted verification flows.',
    icon: 'shield',
  },
  {
    title: 'AI Practice Assistant',
    description: 'Generate adaptive practice questions, study plans, and improvement guidance before the real assessment.',
    icon: 'practice',
  },
  {
    title: 'Performance Tracking Dashboard',
    description: 'See scores, competency trends, and readiness signals in one simple dashboard built for progress tracking.',
    icon: 'dashboard',
  },
  {
    title: 'Verifiable Certificates',
    description: 'Issue shareable proof of employability with verification IDs that employers can trust instantly.',
    icon: 'certificate',
  },
] as const;

const steps = [
  {
    title: 'Create your profile',
    description: 'Join as a student or institution and set up your employability pathway in minutes.',
  },
  {
    title: 'Take a focused assessment',
    description: 'Complete discipline-specific tests with secure online delivery and structured scoring.',
  },
  {
    title: 'See your readiness signal',
    description: 'Understand where you are strong, where you are not, and what employers will notice first.',
  },
  {
    title: 'Earn a verifiable certificate',
    description: 'Share a trusted result with a verification ID that confirms your score and grade.',
  },
  {
    title: 'Improve with AI coaching',
    description: 'Get practice sets, study plans, and targeted next steps to close your skill gaps.',
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[36rem]" style={{ background: 'var(--landing-hero-wash)' }} />
      <LandingNavbar />
      <LandingHero />

      <div className="mx-auto flex max-w-7xl flex-col gap-20 px-4 pb-20 sm:px-6 lg:px-8 lg:gap-24">
        <MotionSection id="features" className="space-y-10">
          <SectionHeading
            eyebrow="Features"
            title="Everything graduates need to prove real-world readiness"
            description="Built for institutions, training programs, and ambitious students who want measurable employability outcomes."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </MotionSection>

        <MotionSection className="space-y-8">
          <SectionHeading
            eyebrow="Student Stories"
            title="Built around the real journey from service year to first career opportunity"
            description="From NYSC to final-year preparation and graduate confidence, GradAssess AI speaks more clearly to the people actually trying to prove they are ready."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'From Camp to Career',
                image:
                  'https://images.pexels.com/photos/33603059/pexels-photo-33603059.jpeg?auto=compress&cs=tinysrgb&w=1200',
                description:
                  'Show the transition from campus life to NYSC service and into stronger, more credible career readiness.',
              },
              {
                title: 'Confidence with proof',
                image:
                  'https://images.pexels.com/photos/18028052/pexels-photo-18028052.jpeg?cs=srgb&dl=pexels-judah-01-11929093-18028052.jpg&fm=jpg',
                description:
                  'Give students more than encouragement by showing them exactly where they stand and what they need to improve next.',
              },
              {
                title: 'Graduation with direction',
                image:
                  'https://images.pexels.com/photos/29852937/pexels-photo-29852937.jpeg?cs=srgb&dl=pexels-ifeyinka-adeyemo-1486499212-29852937.jpg&fm=jpg',
                description:
                  'Help graduates leave school with verified results, stronger self-belief, and a certificate that feels worth sharing.',
              },
            ].map((item, index) => (
              <MotionSection key={item.title} className="landing-card overflow-hidden rounded-[1.8rem]">
                <img
                  src={item.image}
                  alt={index === 0 ? 'NYSC corper in uniform representing the transition from campus to career' : item.title}
                  className="h-64 w-full object-cover sm:h-72"
                />
                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                  </div>
                  <p className="text-sm leading-7 text-[var(--muted)]">{item.description}</p>
                </div>
              </MotionSection>
            ))}
          </div>
        </MotionSection>

        <MotionSection
          id="how-it-works"
          className="landing-section grid gap-8 rounded-[2rem] p-5 backdrop-blur lg:grid-cols-[0.9fr_1.1fr] lg:p-8"
        >
          <div className="space-y-5">
            <SectionHeading
              eyebrow="How It Works"
              title="A clearer journey from campus performance to employability proof"
              description="The process should feel practical, credible, and calm, not like another confusing student portal."
              align="left"
            />
            <div className="practice-highlight rounded-[1.75rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">
                Designed for momentum
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--foreground)]/78">
                Every stage gives the student something useful: a starting point, a score, a signal, a certificate, or a clear improvement plan.
              </p>
              <div className="mt-6 space-y-3">
                <div className="landing-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
                  <span className="text-[var(--foreground)]/88">Avg. time to first assessment</span>
                  <span className="font-semibold text-[var(--foreground)]">8 mins</span>
                </div>
                <div className="landing-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
                  <span className="text-[var(--foreground)]/88">Readiness report generated</span>
                  <span className="font-semibold text-[var(--foreground)]">Instantly</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-6 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-[var(--accent)]/60 via-[var(--accent-alt)]/35 to-transparent md:block" />
            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  <StepCard index={index + 1} title={step.title} description={step.description} />
                </div>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="about" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="landing-section rounded-[2rem] p-7 md:p-8">
            <SectionHeading
              eyebrow="Why This Matters"
              title="Many graduates leave school without knowing if they are truly ready for the job market."
              description="GradAssess AI helps bridge that gap with real assessments, trusted scoring, and AI-guided improvement pathways that connect education to employability."
              align="left"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="practice-highlight rounded-[1.9rem] p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-alt)]">What students face</p>
                  <span className="landing-soft rounded-full px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                    Unclear signal
                  </span>
                </div>
                <p className="mt-4 text-xl font-semibold tracking-tight">
                  Grades can look good while employability still feels uncertain.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Many students leave school without a reliable answer to one question: “Would I perform well if an employer assessed me today?”
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="landing-card rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Student doubt</p>
                    <p className="mt-2 text-lg font-semibold">High</p>
                  </div>
                  <div className="landing-card rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Employer trust</p>
                    <p className="mt-2 text-lg font-semibold">Low</p>
                  </div>
                </div>
              </div>
              <div className="landing-card rounded-[1.9rem] p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-accent-foreground)]">What GradAssess AI changes</p>
                  <span className="landing-soft rounded-full px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                    Verified proof
                  </span>
                </div>
                <p className="mt-4 text-xl font-semibold tracking-tight">
                  Students get a measurable readiness score, not just a hopeful guess.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Real assessments, AI practice support, and trusted certificates create a clearer bridge between graduation and actual job-market confidence.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="landing-soft rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Readiness visibility</p>
                    <p className="mt-2 text-lg font-semibold">Strong</p>
                  </div>
                  <div className="landing-soft rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Next-step clarity</p>
                    <p className="mt-2 text-lg font-semibold">Immediate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <MotionSection className="gradient-ring rounded-[2rem] p-px">
            <div className="landing-section hero-grid rounded-[2rem] p-5 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    Sample Certificate
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">A certificate that feels earned and trusted</h3>
                </div>
                <span className="rounded-full bg-[var(--practice-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-accent-foreground)]">
                  Shareable
                </span>
              </div>

              <div className="landing-card mt-6 rounded-[1.9rem] p-6 shadow-[var(--shadow-soft)]">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">GradAssess AI</p>
                    <h4 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                      Graduate Employability Certificate
                    </h4>
                    <p className="mt-2 max-w-md text-sm leading-7 text-[var(--muted)]">
                      Awarded to candidates who demonstrate strong readiness across practical assessment, discipline competence, and employability indicators.
                    </p>
                  </div>
                  <div className="landing-soft rounded-[1.5rem] px-4 py-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Verification</p>
                    <p className="mt-2 font-semibold">GA-2026-01482</p>
                  </div>
                </div>

                <div className="my-8 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />

                <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Certificate holder</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">Adaeze Okafor</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                      Successfully completed the GradAssess AI employability assessment and demonstrated job-ready capability for graduate-level opportunities.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="landing-soft rounded-[1.4rem] p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Score</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">89%</p>
                    </div>
                    <div className="landing-soft rounded-[1.4rem] p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Grade</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">A</p>
                    </div>
                    <div className="landing-soft rounded-[1.4rem] p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Status</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-[var(--foreground)]">Verified and employer-ready</p>
                        <span className="rounded-full bg-[var(--practice-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--dashboard-accent-foreground)]">
                          Valid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionSection>
        </MotionSection>

        <FinalCta />
      </div>

      <Footer />
    </main>
  );
}
