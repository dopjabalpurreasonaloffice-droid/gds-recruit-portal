import Types "../types/common";
import Map "mo:core/Map";

module {
  public type Application = Types.Application;
  public type ApplicationId = Types.ApplicationId;
  public type UserId = Types.UserId;
  public type ApplicationStatus = Types.ApplicationStatus;
  public type PaymentStatus = Types.PaymentStatus;

  public func getById(applications : Map.Map<ApplicationId, Application>, id : ApplicationId) : ?Application {
    applications.get(id);
  };

  public func getByUser(applications : Map.Map<ApplicationId, Application>, userId : UserId) : [Application] {
    applications.values().filter(func(a : Application) : Bool { a.userId == userId }).toArray()
  };

  public func create(applications : Map.Map<ApplicationId, Application>, app : Application) : () {
    applications.add(app.id, app);
  };

  public func update(applications : Map.Map<ApplicationId, Application>, app : Application) : () {
    applications.add(app.id, app);
  };

  public func updateStatus(applications : Map.Map<ApplicationId, Application>, id : ApplicationId, status : ApplicationStatus) : () {
    switch (applications.get(id)) {
      case (?app) { applications.add(id, { app with status = status }) };
      case null { };
    };
  };

  public func updatePaymentStatus(applications : Map.Map<ApplicationId, Application>, id : ApplicationId, paymentStatus : PaymentStatus) : () {
    switch (applications.get(id)) {
      case (?app) { applications.add(id, { app with paymentStatus = paymentStatus }) };
      case null { };
    };
  };

  public func listAll(applications : Map.Map<ApplicationId, Application>) : [Application] {
    applications.values().toArray();
  };

  public func listByStatus(applications : Map.Map<ApplicationId, Application>, status : ApplicationStatus) : [Application] {
    applications.values().filter(func(a : Application) : Bool { a.status == status }).toArray()
  };
};
