import { FileText } from "lucide-react";
import { NotificationsPage } from "./SiteAdminNotifications";

export default function SiteAdminLetters() {
  return (
    <NotificationsPage
      filterCategory="Official Letters"
      pageTitle="Official Letters"
      pageDesc="Government orders, circulars and official communications"
      icon={<FileText className="w-5 h-5 text-red-700" />}
    />
  );
}
