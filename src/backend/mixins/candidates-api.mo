import Types "../types/common";
import CandLib "../lib/candidates";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  candidates : Map.Map<Types.CandidateId, Types.ShortlistedCandidate>,
  principalIndex : Map.Map<Principal, Types.UserId>,
  users : Map.Map<Types.UserId, Types.User>,
  nextCandidateId : Nat
) {
  func candsIsAdmin(caller : Principal) : Bool {
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };

  func candsRequireAdmin(caller : Principal) {
    if (not candsIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
  };

  // ─── Public ──────────────────────────────────────────────────────────────────

  public query func listAllCandidates() : async [Types.ShortlistedCandidate] {
    CandLib.listAll(candidates)
  };

  public query func listCandidatesByState(stateName : Text) : async [Types.ShortlistedCandidate] {
    CandLib.getByState(candidates, stateName)
  };

  public query func listCandidatesByCircle(circle : Text) : async [Types.ShortlistedCandidate] {
    CandLib.getByCircle(candidates, circle)
  };

  public query func getCandidateById(id : Types.CandidateId) : async ?Types.ShortlistedCandidate {
    CandLib.getById(candidates, id)
  };

  // ─── Admin ───────────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminAddCandidate(
    applicationId : Types.ApplicationId,
    candidateName : Text,
    rollNumber : Text,
    state : Text,
    circle : Text,
    division : Text,
    category : Text,
    rank : Nat
  ) : async Types.CandidateId {
    candsRequireAdmin(caller);
    let id = candidates.size() + 1;
    let candidate : Types.ShortlistedCandidate = {
      id = id;
      applicationId = applicationId;
      candidateName = candidateName;
      rollNumber = rollNumber;
      state = state;
      circle = circle;
      division = division;
      category = category;
      rank = rank;
    };
    CandLib.create(candidates, candidate);
    id
  };

  public shared ({ caller }) func adminDeleteCandidate(id : Types.CandidateId) : async () {
    candsRequireAdmin(caller);
    switch (CandLib.getById(candidates, id)) {
      case null { Runtime.trap("Candidate not found") };
      case (?_) { CandLib.delete(candidates, id) };
    };
  };
};
