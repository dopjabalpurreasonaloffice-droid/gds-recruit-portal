import { UserPlus } from "lucide-react";
import { NotificationsPage } from "./SiteAdminNotifications";

export default function SiteAdminRecruitment() {
  return (
    <NotificationsPage
      filterCategory="Recruitment"
      pageTitle="Recruitment Notices"
      pageDesc="GDS schedule drives, vacancy announcements, and selection notices"
      icon={<UserPlus className="w-5 h-5 text-green-700" />}
    />
  );
}
