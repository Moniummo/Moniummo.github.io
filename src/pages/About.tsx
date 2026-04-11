import PageLayout from "@/components/PageLayout";

const About = () => {
  return (
    <PageLayout title="About Me">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
        About Me
      </h1>
      <div className="space-y-6 font-body text-muted-foreground leading-relaxed max-w-2xl">
        <p>
          Hello! I'm a biomedical engineer passionate about applying engineering
          principles to solve problems in healthcare and medicine. Replace this
          text with your own story.
        </p>
        <p>
          Share your background, what drives you, your interests both inside and
          outside of engineering, and what you're looking to do next.
        </p>
      </div>
      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="font-display text-sm tracking-widest uppercase text-primary mb-4">
          Connect
        </h2>
        <div className="flex flex-col gap-2 font-body text-muted-foreground">
          <span>your.email@example.com</span>
          <span>linkedin.com/in/yourprofile</span>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;
