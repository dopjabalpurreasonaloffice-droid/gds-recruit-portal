import { Briefcase } from "lucide-react";
import { NotificationsPage } from "./SiteAdminNotifications";

export default function SiteAdminTenders() {
  return (
    <NotificationsPage
      filterCategory="Tenders"
      pageTitle="Tenders"
      pageDesc="Procurement, tender notices, and bid documents"
      icon={<Briefcase className="w-5 h-5 text-orange-600" />}
    />
  );
}
