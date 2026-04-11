import PageLayout from "@/components/PageLayout";

const Resume = () => {
  return (
    <PageLayout title="Resume">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-12">
        Resume
      </h1>

      <section className="mb-12">
        <h2 className="font-display text-sm tracking-widest uppercase text-primary mb-6">
          Education
        </h2>
        <div className="border-b border-border pb-6 mb-6">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-display text-lg font-bold text-foreground">
              Your University
            </h3>
            <span className="font-display text-sm text-muted-foreground">2020 – 2024</span>
          </div>
          <p className="font-body text-muted-foreground">B.S. Biomedical Engineering</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-sm tracking-widest uppercase text-primary mb-6">
          Experience
        </h2>
        <div className="border-b border-border pb-6 mb-6">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-display text-lg font-bold text-foreground">
              Research Assistant
            </h3>
            <span className="font-display text-sm text-muted-foreground">2023 – Present</span>
          </div>
          <p className="font-body text-muted-foreground">
            Brief description of your role and responsibilities.
          </p>
        </div>
        <div className="border-b border-border pb-6 mb-6">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-display text-lg font-bold text-foreground">
              Engineering Intern
            </h3>
            <span className="font-display text-sm text-muted-foreground">Summer 2022</span>
          </div>
          <p className="font-body text-muted-foreground">
            Brief description of your internship experience.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm tracking-widest uppercase text-primary mb-6">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {["MATLAB", "Python", "SolidWorks", "CAD", "Signal Processing", "Lab Techniques", "Technical Writing"].map(
            (skill) => (
              <span
                key={skill}
                className="font-display text-xs tracking-wider uppercase px-3 py-1 border border-border text-muted-foreground"
              >
                {skill}
              </span>
            )
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Resume;
