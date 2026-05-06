import Types "../types/common";
import Map "mo:core/Map";

module {
  public type Payment = Types.Payment;
  public type PaymentId = Types.PaymentId;
  public type ApplicationId = Types.ApplicationId;
  public type UserId = Types.UserId;
  public type PaymentStatus = Types.PaymentStatus;

  public func getById(payments : Map.Map<PaymentId, Payment>, id : PaymentId) : ?Payment {
    payments.get(id);
  };

  public func getByApplication(payments : Map.Map<PaymentId, Payment>, applicationId : ApplicationId) : ?Payment {
    payments.values().find(func(p : Payment) : Bool { p.applicationId == applicationId })
  };

  public func getByUser(payments : Map.Map<PaymentId, Payment>, userId : UserId) : [Payment] {
    payments.values().filter(func(p : Payment) : Bool { p.userId == userId }).toArray()
  };

  public func create(payments : Map.Map<PaymentId, Payment>, payment : Payment) : () {
    payments.add(payment.id, payment);
  };

  public func updateStatus(payments : Map.Map<PaymentId, Payment>, id : PaymentId, status : PaymentStatus) : () {
    switch (payments.get(id)) {
      case (?p) { payments.add(id, { p with status = status }) };
      case null { };
    };
  };

  public func listAll(payments : Map.Map<PaymentId, Payment>) : [Payment] {
    payments.values().toArray();
  };
};
