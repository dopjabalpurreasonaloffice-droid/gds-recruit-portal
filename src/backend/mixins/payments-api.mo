import Types "../types/common";
import PayLib "../lib/payments";
import AppLib "../lib/applications";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";

mixin (
  payments : Map.Map<Types.PaymentId, Types.Payment>,
  applications : Map.Map<Types.ApplicationId, Types.Application>,
  principalIndex : Map.Map<Principal, Types.UserId>,
  users : Map.Map<Types.UserId, Types.User>,
  nextPaymentId : Nat
) {
  func payRequireUser(caller : Principal) : Types.User {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be authenticated");
    };
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not registered") };
    };
  };

  func payIsAdmin(caller : Principal) : Bool {
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
  };

  func genTransactionId(paymentId : Nat, now : Int) : Text {
    let timeComponent = Int.abs(now) % 100_000;
    "TXN" # paymentId.toText() # timeComponent.toText()
  };

  public shared ({ caller }) func initiatePayment(
    applicationId : Types.ApplicationId,
    amount : Nat,
    method : Types.PaymentMethod
  ) : async Types.PaymentId {
    let u = payRequireUser(caller);
    switch (AppLib.getById(applications, applicationId)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        if (app.userId != u.id) { Runtime.trap("Unauthorized: not your application") };
        if (app.status != #submitted) { Runtime.trap("Application must be submitted before payment") };
        // Check no existing successful payment
        switch (PayLib.getByApplication(payments, applicationId)) {
          case (?p) {
            if (p.status == #success) { Runtime.trap("Payment already completed") };
          };
          case null { };
        };
        let pid = payments.size() + 1;
        let now = Time.now();
        let txnId = genTransactionId(pid, now);
        let payment : Types.Payment = {
          id = pid;
          applicationId = applicationId;
          userId = u.id;
          amount = 100; // flat mock fee
          method = method;
          transactionId = txnId;
          status = #pending;
          createdAt = now;
        };
        PayLib.create(payments, payment);
        pid
      };
    };
  };

  public shared ({ caller }) func confirmPayment(
    paymentId : Types.PaymentId,
    transactionId : Text
  ) : async () {
    let u = payRequireUser(caller);
    switch (PayLib.getById(payments, paymentId)) {
      case null { Runtime.trap("Payment not found") };
      case (?p) {
        if (p.userId != u.id and not payIsAdmin(caller)) {
          Runtime.trap("Unauthorized: not your payment");
        };
        PayLib.updateStatus(payments, paymentId, #success);
        AppLib.updatePaymentStatus(applications, p.applicationId, #success);
      };
    };
  };

  public query ({ caller }) func getMyPayments() : async [Types.Payment] {
    if (caller.isAnonymous()) { return [] };
    switch (UserLib.getByPrincipal(principalIndex, users, caller)) {
      case null { [] };
      case (?u) { PayLib.getByUser(payments, u.id) };
    };
  };

  public query ({ caller }) func getPaymentById(id : Types.PaymentId) : async ?Types.Payment {
    PayLib.getById(payments, id)
  };

  // ─── Admin ───────────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminListPayments() : async [Types.Payment] {
    if (not payIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    PayLib.listAll(payments)
  };

  public shared ({ caller }) func adminUpdatePaymentStatus(id : Types.PaymentId, status : Types.PaymentStatus) : async () {
    if (not payIsAdmin(caller)) { Runtime.trap("Unauthorized: admins only") };
    switch (PayLib.getById(payments, id)) {
      case null { Runtime.trap("Payment not found") };
      case (?p) {
        PayLib.updateStatus(payments, id, status);
        if (status == #success) {
          AppLib.updatePaymentStatus(applications, p.applicationId, #success);
        };
      };
    };
  };
};
