import Types "../types/common";
import CircleLib "../lib/circles";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  circles : Map.Map<Types.CircleId, Types.Circle>,
  principalIndex : Map.Map<Principal, Types.UserId>,
  users : Map.Map<Types.UserId, Types.User>,
  nextCircleId : Nat
) {
  func circlesIsAdmin(caller : Principal) : Bool {
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };

  func circlesRequireAdmin(caller : Principal) {
    if (not circlesIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
  };

  // ─── Public ──────────────────────────────────────────────────────────────────

  public query func listAllCircles() : async [Types.Circle] {
    CircleLib.listAll(circles)
  };

  public query func listCirclesByState(stateName : Text) : async [Types.Circle] {
    CircleLib.getByState(circles, stateName)
  };

  public query func listStates() : async [Text] {
    CircleLib.listStates(circles)
  };

  public query func getCircleById(id : Types.CircleId) : async ?Types.Circle {
    CircleLib.getById(circles, id)
  };

  // ─── Admin ───────────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminCreateCircle(
    stateName : Text,
    circleName : Text,
    divisions : [Types.Division]
  ) : async Types.CircleId {
    circlesRequireAdmin(caller);
    let id = circles.size() + 1;
    let circle : Types.Circle = {
      id = id;
      stateName = stateName;
      circleName = circleName;
      divisions = divisions;
    };
    CircleLib.create(circles, circle);
    id
  };

  public shared ({ caller }) func adminUpdateCircle(
    id : Types.CircleId,
    stateName : Text,
    circleName : Text,
    divisions : [Types.Division]
  ) : async () {
    circlesRequireAdmin(caller);
    switch (CircleLib.getById(circles, id)) {
      case null { Runtime.trap("Circle not found") };
      case (?c) {
        CircleLib.update(circles, { c with stateName = stateName; circleName = circleName; divisions = divisions });
      };
    };
  };

  public shared ({ caller }) func adminDeleteCircle(id : Types.CircleId) : async () {
    circlesRequireAdmin(caller);
    switch (CircleLib.getById(circles, id)) {
      case null { Runtime.trap("Circle not found") };
      case (?_) { CircleLib.delete(circles, id) };
    };
  };
};
