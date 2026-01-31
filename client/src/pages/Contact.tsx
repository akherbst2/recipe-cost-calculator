import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Mail, MessageCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function Contact() {
  const { t } = useTranslation();
  const email = 'alyssaherbst@gmail.com';

  // Update meta tags for SEO
  useEffect(() => {
    document.title = 'Contact Us - Recipe Cost Calculator';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get in touch with questions, feedback, or suggestions about Recipe Cost Calculator. Email alyssaherbst@gmail.com for support or feature requests.');
    }
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://recipe-cost-calculator.manus.space/contact');
    }
  }, []);

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b border-border/50">
        <div className="container py-12 md:py-16">
          <Link href="/">
            <Button variant="ghost" className="mb-6 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('contact.backHome')}
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-[1.25rem] p-8 md:p-12 shadow-soft border border-border/50">
            {/* Email Section */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                  {t('contact.getInTouch')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {t('contact.description')}
                </p>
              </div>

              {/* Email Display */}
              <div className="bg-muted/50 rounded-lg p-6 border border-border/50">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-medium text-foreground">
                    {email}
                  </span>
                </div>
                <Button
                  onClick={handleEmailClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t('contact.sendEmail')}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-border/50 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('contact.responseTime')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/about">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t('contact.learnMore')}
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t('contact.backToCalculator')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
