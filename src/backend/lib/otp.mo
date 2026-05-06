import Types "../types/common";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type OTPRecord = Types.OTPRecord;

  // OTP is valid for 10 minutes (600 billion nanoseconds)
  let otpTtlNanos : Int = 600_000_000_000;

  public func generate(otps : Map.Map<Text, OTPRecord>, id : Nat, contact : Text, code : Text) : () {
    let expiresAt = Time.now() + otpTtlNanos;
    let record : OTPRecord = {
      id = id;
      contact = contact;
      code = code;
      expiresAt = expiresAt;
      verified = false;
    };
    otps.add(contact, record);
  };

  public func verify(otps : Map.Map<Text, OTPRecord>, contact : Text, code : Text) : Bool {
    switch (otps.get(contact)) {
      case (?record) {
        if (record.verified) { return false };
        if (Time.now() > record.expiresAt) { return false };
        record.code == code
      };
      case null { false };
    };
  };

  public func invalidate(otps : Map.Map<Text, OTPRecord>, contact : Text) : () {
    switch (otps.get(contact)) {
      case (?record) {
        otps.add(contact, { record with verified = true });
      };
      case null { };
    };
  };

  public func isExpired(record : OTPRecord) : Bool {
    Time.now() > record.expiresAt;
  };
};
