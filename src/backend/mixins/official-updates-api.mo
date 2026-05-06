import Types "../types/common";
import OfficialUpdatesLib "../lib/official-updates";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

mixin (
  officialUpdates : Map.Map<Text, Types.OfficialUpdate>,
  principalIndex : Map.Map<Principal, Types.UserId>,
  users : Map.Map<Types.UserId, Types.User>,
  nextOfficialUpdateId : Nat
) {
  // 30 days in nanoseconds
  let thirtyDaysNs : Int = 30 * 24 * 60 * 60 * 1_000_000_000;

  func ouIsAdmin(caller : Principal) : Bool {
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };

  func ouRequireAdmin(caller : Principal) {
    if (not ouIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
  };

  func computeIsNew(date : Types.Timestamp) : Bool {
    (Time.now() - date) < thirtyDaysNs
  };

  // ─── Public ──────────────────────────────────────────────────────────────────

  public query func listActiveOfficialUpdates() : async [Types.OfficialUpdate] {
    OfficialUpdatesLib.listActive(officialUpdates)
  };

  public query func listOfficialUpdatesByCategory(category : Types.UpdateCategory) : async [Types.OfficialUpdate] {
    OfficialUpdatesLib.listByCategory(officialUpdates, category)
  };

  // ─── Admin ───────────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminCreateOfficialUpdate(
    title : Text,
    content : Text,
    category : Types.UpdateCategory,
    pdfUrl : ?Text
  ) : async { #ok : Types.OfficialUpdate; #err : Text } {
    ouRequireAdmin(caller);
    let id = (officialUpdates.size() + 1).toText();
    let now = Time.now();
    let item : Types.OfficialUpdate = {
      id = id;
      title = title;
      content = content;
      category = category;
      date = now;
      pdfUrl = pdfUrl;
      isNew = true;
      isActive = true;
      createdBy = caller.toText();
    };
    OfficialUpdatesLib.create(officialUpdates, item);
    #ok(item)
  };

  public shared ({ caller }) func adminUpdateOfficialUpdate(
    id : Text,
    title : ?Text,
    content : ?Text,
    pdfUrl : ?Text,
    isActive : ?Bool
  ) : async { #ok : Types.OfficialUpdate; #err : Text } {
    ouRequireAdmin(caller);
    switch (OfficialUpdatesLib.getById(officialUpdates, id)) {
      case null { #err("Official update not found") };
      case (?existing) {
        let updated : Types.OfficialUpdate = {
          existing with
          title = switch (title) { case (?t) t; case null existing.title };
          content = switch (content) { case (?c) c; case null existing.content };
          pdfUrl = switch (pdfUrl) { case (?p) ?p; case null existing.pdfUrl };
          isActive = switch (isActive) { case (?a) a; case null existing.isActive };
          isNew = computeIsNew(existing.date);
        };
        OfficialUpdatesLib.update(officialUpdates, updated);
        #ok(updated)
      };
    };
  };

  public shared ({ caller }) func adminDeleteOfficialUpdate(id : Text) : async { #ok : (); #err : Text } {
    ouRequireAdmin(caller);
    switch (OfficialUpdatesLib.getById(officialUpdates, id)) {
      case null { #err("Official update not found") };
      case (?_) {
        OfficialUpdatesLib.delete(officialUpdates, id);
        #ok(())
      };
    };
  };

  public shared ({ caller }) func adminListAllOfficialUpdates() : async [Types.OfficialUpdate] {
    ouRequireAdmin(caller);
    OfficialUpdatesLib.listAll(officialUpdates)
  };
};
