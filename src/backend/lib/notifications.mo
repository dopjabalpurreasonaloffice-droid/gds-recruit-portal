import Types "../types/common";
import Map "mo:core/Map";

module {
  public type Notification = Types.Notification;
  public type NotificationId = Types.NotificationId;
  public type NotifType = Types.NotifType;
  public type UserId = Types.UserId;

  public func getById(notifications : Map.Map<NotificationId, Notification>, id : NotificationId) : ?Notification {
    notifications.get(id);
  };

  public func create(notifications : Map.Map<NotificationId, Notification>, notif : Notification) : () {
    notifications.add(notif.id, notif);
  };

  public func update(notifications : Map.Map<NotificationId, Notification>, notif : Notification) : () {
    notifications.add(notif.id, notif);
  };

  public func deactivate(notifications : Map.Map<NotificationId, Notification>, id : NotificationId) : () {
    switch (notifications.get(id)) {
      case (?n) { notifications.add(id, { n with isActive = false }) };
      case null { };
    };
  };

  public func delete(notifications : Map.Map<NotificationId, Notification>, id : NotificationId) : () {
    notifications.remove(id);
  };

  public func listActive(notifications : Map.Map<NotificationId, Notification>) : [Notification] {
    notifications.values().filter(func(n : Notification) : Bool { n.isActive }).toArray()
  };

  public func listAll(notifications : Map.Map<NotificationId, Notification>) : [Notification] {
    notifications.values().toArray();
  };
};
