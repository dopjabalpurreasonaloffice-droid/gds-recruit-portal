import Types "../types/common";
import NotifLib "../lib/notifications";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

mixin (
  notifications : Map.Map<Types.NotificationId, Types.Notification>,
  principalIndex : Map.Map<Principal, Types.UserId>,
  users : Map.Map<Types.UserId, Types.User>,
  nextNotificationId : Nat
) {
  func notifIsAdmin(caller : Principal) : Bool {
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };

  func notifRequireAdmin(caller : Principal) {
    if (not notifIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
  };

  // ─── Public ──────────────────────────────────────────────────────────────────

  public query func listActiveNotifications() : async [Types.Notification] {
    NotifLib.listActive(notifications)
  };

  public query func getNotificationById(id : Types.NotificationId) : async ?Types.Notification {
    NotifLib.getById(notifications, id)
  };

  // ─── Admin ───────────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminCreateNotification(
    title : Text,
    content : Text,
    notifType : Types.NotifType
  ) : async Types.NotificationId {
    notifRequireAdmin(caller);
    // Get caller's user id (0 if not found, shouldn't happen for admin)
    let creatorId = switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.id };
      case null { 0 };
    };
    let id = notifications.size() + 1;
    let notif : Types.Notification = {
      id = id;
      title = title;
      content = content;
      notifType = notifType;
      date = Time.now();
      isActive = true;
      createdBy = creatorId;
    };
    NotifLib.create(notifications, notif);
    id
  };

  public shared ({ caller }) func adminUpdateNotification(
    id : Types.NotificationId,
    title : Text,
    content : Text,
    notifType : Types.NotifType
  ) : async () {
    notifRequireAdmin(caller);
    switch (NotifLib.getById(notifications, id)) {
      case null { Runtime.trap("Notification not found") };
      case (?n) {
        NotifLib.update(notifications, { n with title = title; content = content; notifType = notifType });
      };
    };
  };

  public shared ({ caller }) func adminDeactivateNotification(id : Types.NotificationId) : async () {
    notifRequireAdmin(caller);
    switch (NotifLib.getById(notifications, id)) {
      case null { Runtime.trap("Notification not found") };
      case (?_) { NotifLib.deactivate(notifications, id) };
    };
  };

  public shared ({ caller }) func adminDeleteNotification(id : Types.NotificationId) : async () {
    notifRequireAdmin(caller);
    switch (NotifLib.getById(notifications, id)) {
      case null { Runtime.trap("Notification not found") };
      case (?_) { NotifLib.delete(notifications, id) };
    };
  };

  public shared ({ caller }) func adminListAllNotifications() : async [Types.Notification] {
    notifRequireAdmin(caller);
    NotifLib.listAll(notifications)
  };
};
