import Types "../types/common";
import OtpLib "../lib/otp";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import Int "mo:core/Int";

mixin (
  otps : Map.Map<Text, Types.OTPRecord>,
  nextOtpId : Nat,
  users : Map.Map<Types.UserId, Types.User>,
  principalIndex : Map.Map<Principal, Types.UserId>
) {
  // Generate a pseudo-random 6-digit OTP code using time-based seed
  func generateCode(contact : Text, now : Int) : Text {
    let seed = Int.abs(now) + contact.size() * 999983;
    let code = seed % 1_000_000;
    let s = code.toText();
    // Pad with leading zeros to ensure 6 digits
    if (s.size() >= 6) { s } else {
      let needed = 6 - s.size() : Nat;
      var prefix = "";
      var i = 0;
      while (i < needed) {
        prefix := prefix # "0";
        i += 1;
      };
      prefix # s
    }
  };

  public shared ({ caller }) func requestOTP(contact : Text) : async Bool {
    let now = Time.now();
    let code = generateCode(contact, now);
    let id = otps.size() + 1;
    OtpLib.generate(otps, id, contact, code);
    // Mock: log OTP for debugging
    Debug.print("OTP for " # contact # ": " # code);
    true
  };

  public shared ({ caller }) func verifyOTP(contact : Text, code : Text) : async Bool {
    // Mock: 000000 is always valid for testing
    let valid = code == "000000" or OtpLib.verify(otps, contact, code);
    if (valid) {
      OtpLib.invalidate(otps, contact);
      // Mark caller's user as verified if they have an account
      switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
        case (?u) { UserLib.setVerified(users, u.id, true) };
        case null { };
      };
    };
    valid
  };
};
