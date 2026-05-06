import Types "../types/common";
import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  public type User = Types.User;
  public type UserId = Types.UserId;
  public type UserRole = Types.UserRole;
  public type AddressType = Types.AddressType;

  public func getById(users : Map.Map<UserId, User>, id : UserId) : ?User {
    users.get(id);
  };

  public func getByPrincipal(principalIndex : Map.Map<Principal, UserId>, users : Map.Map<UserId, User>, p : Principal) : ?User {
    switch (principalIndex.get(p)) {
      case (?uid) { users.get(uid) };
      case null { null };
    };
  };

  public func create(users : Map.Map<UserId, User>, principalIndex : Map.Map<Principal, UserId>, user : User) : () {
    users.add(user.id, user);
    principalIndex.add(user.principal, user.id);
  };

  public func update(users : Map.Map<UserId, User>, user : User) : () {
    users.add(user.id, user);
  };

  public func setRole(users : Map.Map<UserId, User>, id : UserId, role : UserRole) : () {
    switch (users.get(id)) {
      case (?u) { users.add(id, { u with role = role }) };
      case null { };
    };
  };

  public func setVerified(users : Map.Map<UserId, User>, id : UserId, verified : Bool) : () {
    switch (users.get(id)) {
      case (?u) { users.add(id, { u with isVerified = verified }) };
      case null { };
    };
  };

  public func listAll(users : Map.Map<UserId, User>) : [User] {
    users.values().toArray();
  };

  public func delete(users : Map.Map<UserId, User>, principalIndex : Map.Map<Principal, UserId>, id : UserId) : () {
    switch (users.get(id)) {
      case (?u) {
        principalIndex.remove(u.principal);
        users.remove(id);
      };
      case null { };
    };
  };

  // Check if a mobile number already exists
  public func mobileExists(users : Map.Map<UserId, User>, mobile : Text) : Bool {
    users.any(func(_, u) { u.mobile == mobile });
  };

  // Check if an email already exists
  public func emailExists(users : Map.Map<UserId, User>, email : Text) : Bool {
    users.any(func(_, u) { u.email == email });
  };

  // Mask Aadhaar: keep only last 4 digits, format XXXX-XXXX-XXXX
  public func maskAadhaar(aadhaar : Text) : Text {
    let size = aadhaar.size();
    if (size < 4) { return "XXXX-XXXX-XXXX" };
    let chars = aadhaar.toArray();
    let sizeInt = size.toInt();
    let last4 = Text.fromArray(chars.sliceToArray(sizeInt - 4, sizeInt));
    "XXXX-XXXX-" # last4
  };
};
