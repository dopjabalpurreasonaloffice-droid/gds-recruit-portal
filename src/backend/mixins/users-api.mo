import Types "../types/common";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

mixin (
  users : Map.Map<Types.UserId, Types.User>,
  principalIndex : Map.Map<Principal, Types.UserId>,
  nextUserId : Nat
) {
  // ─── Helper ──────────────────────────────────────────────────────────────────

  func usersRequireUser(caller : Principal) : Types.User {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be authenticated");
    };
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
  };

  func usersIsAdmin(caller : Principal) : Bool {
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };

  // Validate that a text contains only digit characters
  func usersIsAllDigits(t : Text) : Bool {
    t.size() > 0 and t.foldLeft(
      true,
      func(acc : Bool, c : Char) : Bool {
        acc and c >= '0' and c <= '9'
      }
    )
  };

  // ─── Registration & Profile ──────────────────────────────────────────────────

  public shared ({ caller }) func registerUser(
    name : Text,
    mobile : Text,
    email : Text,
    aadhaar : Text,
    dob : Text,
    gender : Text,
    category : Text,
    subcategory : Text,
    address : Types.AddressType
  ) : async Types.UserId {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be authenticated");
    };
    // Check for duplicate principal
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case null { };
    };
    // Validate inputs
    if (name.size() == 0) { Runtime.trap("Name cannot be empty") };
    if (mobile.size() != 10) { Runtime.trap("Mobile must be 10 digits") };
    if (not usersIsAllDigits(mobile)) { Runtime.trap("Mobile must contain only digits") };
    if (not email.contains(#char('@'))) { Runtime.trap("Invalid email format") };
    if (aadhaar.size() != 12) { Runtime.trap("Aadhaar must be 12 digits") };
    if (dob.size() == 0) { Runtime.trap("Date of birth cannot be empty") };
    // Check duplicates
    if (UserLib.mobileExists(users, mobile)) { Runtime.trap("Mobile already registered") };
    if (UserLib.emailExists(users, email)) { Runtime.trap("Email already registered") };

    let uid = users.size() + 1;
    let maskedAadhaar = UserLib.maskAadhaar(aadhaar);
    let user : Types.User = {
      id = uid;
      principal = caller;
      name = name;
      mobile = mobile;
      email = email;
      aadhaar = maskedAadhaar;
      dob = dob;
      gender = gender;
      category = category;
      subcategory = subcategory;
      address = address;
      photoUrl = null;
      signatureUrl = null;
      role = #applicant;
      isVerified = false;
      createdAt = Time.now();
    };
    UserLib.create(users, principalIndex, user);
    uid
  };

  public shared ({ caller }) func updateProfile(
    name : Text,
    dob : Text,
    gender : Text,
    category : Text,
    subcategory : Text,
    address : Types.AddressType
  ) : async () {
    let u = usersRequireUser(caller);
    UserLib.update(users, { u with name = name; dob = dob; gender = gender; category = category; subcategory = subcategory; address = address });
  };

  public shared ({ caller }) func updatePhotoUrl(url : Text) : async () {
    let u = usersRequireUser(caller);
    UserLib.update(users, { u with photoUrl = ?url });
  };

  public shared ({ caller }) func updateSignatureUrl(url : Text) : async () {
    let u = usersRequireUser(caller);
    UserLib.update(users, { u with signatureUrl = ?url });
  };

  public query ({ caller }) func getMyProfile() : async ?Types.User {
    if (caller.isAnonymous()) { return null };
    UserLib.getByPrincipal(principalIndex, users, caller)
  };

  public query func getUserById(id : Types.UserId) : async ?Types.User {
    UserLib.getById(users, id)
  };

  // ─── Admin: User Management ──────────────────────────────────────────────────

  public shared ({ caller }) func adminListUsers() : async [Types.User] {
    if (not usersIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    UserLib.listAll(users)
  };

  public shared ({ caller }) func adminSetUserRole(id : Types.UserId, role : Types.UserRole) : async () {
    if (not usersIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    switch (UserLib.getById(users, id)) {
      case null { Runtime.trap("User not found") };
      case (?_) { UserLib.setRole(users, id, role) };
    };
  };

  public shared ({ caller }) func adminDeleteUser(id : Types.UserId) : async () {
    if (not usersIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    switch (UserLib.getById(users, id)) {
      case null { Runtime.trap("User not found") };
      case (?_) { UserLib.delete(users, principalIndex, id) };
    };
  };

  public shared ({ caller }) func adminVerifyUser(id : Types.UserId) : async () {
    if (not usersIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    switch (UserLib.getById(users, id)) {
      case null { Runtime.trap("User not found") };
      case (?_) { UserLib.setVerified(users, id, true) };
    };
  };
};
