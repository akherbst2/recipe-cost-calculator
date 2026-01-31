import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Code2, Heart, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function About() {
  const { t } = useTranslation();

  // Update meta tags for SEO
  useEffect(() => {
    document.title = 'About Us - Recipe Cost Calculator';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about Alyssa, the software engineer who created Recipe Cost Calculator as a fun project to help home cooks, food bloggers, and small businesses calculate recipe costs.');
    }
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://recipe-cost-calculator.manus.space/about');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b border-border/50">
        <div className="container py-12 md:py-16">
          <Link href="/">
            <Button variant="ghost" className="mb-6 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('about.backHome')}
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t('about.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-[1.25rem] p-8 md:p-12 shadow-soft border border-border/50 space-y-8">
            {/* Introduction */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                  {t('about.greeting')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.intro')}
                </p>
              </div>
            </div>

            {/* Why I Built This */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Code2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                  {t('about.whyTitle')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('about.whyContent1')}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.whyContent2')}
                </p>
              </div>
            </div>

            {/* Hope It Helps */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                  {t('about.hopeTitle')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.hopeContent')}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6 border-t border-border/50">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                    {t('about.tryCalculator')}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full sm:w-auto">
                    {t('about.getInTouch')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
