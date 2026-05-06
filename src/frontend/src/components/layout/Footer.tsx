import { useLanguage } from "@/hooks/use-language";
import { Link } from "@tanstack/react-router";
import { ExternalLink, HeadphonesIcon, Mail, Phone } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const footerLinks = [
    { labelKey: "footer.about", href: "#" },
    { labelKey: "footer.privacyPolicy", href: "#" },
    { labelKey: "footer.termsOfUse", href: "#" },
    { labelKey: "footer.contactUs", href: "#" },
    { labelKey: "footer.rti", href: "#" },
    { labelKey: "footer.sitemap", href: "#" },
    { labelKey: "footer.screenReader", href: "#" },
  ];

  return (
    <footer
      className="bg-card border-t border-border mt-auto pt-8"
      data-ocid="portal-footer"
    >
      {/* Main footer content */}
      <div className="px-4 lg:px-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[#B22222]/10 flex items-center justify-center shrink-0">
                <span className="text-[#B22222] font-bold text-xs">IP</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  India Post
                </p>
                <p className="text-xs text-muted-foreground">
                  GDS Online Engagement System
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("footer.govIndia")} — {t("footer.deptPosts")}
              <br />
              {t("footer.ministry")}, New Delhi - 110001
              <br />
              <span className="text-[10px]">
                O/o The Chief Postmaster General, MP Circle, Regional Office
                Jabalpur
              </span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-y-1.5 gap-x-2">
              {footerLinks.map((link) => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-orange-500 hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] rounded"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Help & Support
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 shrink-0 text-[#B22222]" />
                <span>Help Desk: 011-23096086</span>
              </div>
              <div className="flex items-center gap-2">
                <HeadphonesIcon className="h-3 w-3 shrink-0 text-[#B22222]" />
                <span>Mon–Fri, 10 AM – 5 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 shrink-0 text-[#B22222]" />
                <span>appost.india@gmail.com</span>
              </div>
            </div>
            <a
              href="https://indiapost.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-[#B22222] hover:underline hover:text-orange-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] rounded"
            >
              <ExternalLink className="h-3 w-3" />
              India Post Official Website
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border px-4 lg:px-8 py-3 bg-muted/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            © {year} {t("footer.govIndia")}. {t("footer.copyright")}
          </p>
          <p className="text-center sm:text-right">{t("footer.disclaimer")}</p>
        </div>
        <div className="mt-2 pt-2 border-t border-border/50 text-center">
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
          >
            © {year}. Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
