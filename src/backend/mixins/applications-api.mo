import Types "../types/common";
import AppLib "../lib/applications";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

mixin (
  applications : Map.Map<Types.ApplicationId, Types.Application>,
  users : Map.Map<Types.UserId, Types.User>,
  principalIndex : Map.Map<Principal, Types.UserId>,
  nextApplicationId : Nat
) {
  func appsRequireUser(caller : Principal) : Types.User {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be authenticated");
    };
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };
  };

  func appsIsAdmin(caller : Principal) : Bool {
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };

  public shared ({ caller }) func createApplication(
    educationDetails : Types.EducationDetails,
    preferences : Types.Preferences
  ) : async Types.ApplicationId {
    let u = appsRequireUser(caller);
    // One application per user
    let existing = AppLib.getByUser(applications, u.id);
    if (existing.size() > 0) {
      Runtime.trap("Application already exists for this user");
    };
    let id = applications.size() + 1;
    // (counter param not mutated — using map size as id)
    let app : Types.Application = {
      id = id;
      userId = u.id;
      educationDetails = educationDetails;
      preferences = preferences;
      documentUrls = [];
      status = #draft;
      paymentStatus = #notRequired;
      submittedAt = null;
      createdAt = Time.now();
    };
    AppLib.create(applications, app);
    id
  };

  public shared ({ caller }) func updateApplication(
    id : Types.ApplicationId,
    educationDetails : Types.EducationDetails,
    preferences : Types.Preferences
  ) : async () {
    let u = appsRequireUser(caller);
    switch (AppLib.getById(applications, id)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        if (app.userId != u.id) { Runtime.trap("Unauthorized: not your application") };
        if (app.status != #draft) { Runtime.trap("Cannot update submitted application") };
        AppLib.update(applications, { app with educationDetails = educationDetails; preferences = preferences });
      };
    };
  };

  public shared ({ caller }) func submitApplication(id : Types.ApplicationId) : async () {
    let u = appsRequireUser(caller);
    switch (AppLib.getById(applications, id)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        if (app.userId != u.id) { Runtime.trap("Unauthorized: not your application") };
        if (app.status != #draft) { Runtime.trap("Application already submitted") };
        AppLib.update(applications, { app with status = #submitted; submittedAt = ?Time.now() });
      };
    };
  };

  public shared ({ caller }) func addDocumentUrl(id : Types.ApplicationId, url : Text) : async () {
    let u = appsRequireUser(caller);
    switch (AppLib.getById(applications, id)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        if (app.userId != u.id) { Runtime.trap("Unauthorized: not your application") };
        let updatedDocs = app.documentUrls.concat([url]);
        AppLib.update(applications, { app with documentUrls = updatedDocs });
      };
    };
  };

  public query ({ caller }) func getMyApplications() : async [Types.Application] {
    if (caller.isAnonymous()) { return [] };
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case null { [] };
      case (?u) { AppLib.getByUser(applications, u.id) };
    };
  };

  public query ({ caller }) func getApplicationById(id : Types.ApplicationId) : async ?Types.Application {
    AppLib.getById(applications, id)
  };

  // ─── Admin ───────────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminListApplications() : async [Types.Application] {
    if (not appsIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    AppLib.listAll(applications)
  };

  public shared ({ caller }) func adminListApplicationsByStatus(status : Types.ApplicationStatus) : async [Types.Application] {
    if (not appsIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    AppLib.listByStatus(applications, status)
  };

  public shared ({ caller }) func adminUpdateApplicationStatus(id : Types.ApplicationId, status : Types.ApplicationStatus) : async () {
    if (not appsIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    switch (AppLib.getById(applications, id)) {
      case null { Runtime.trap("Application not found") };
      case (?_) { AppLib.updateStatus(applications, id, status) };
    };
  };
};
