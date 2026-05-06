import Types "../types/common";
import Map "mo:core/Map";
import Int "mo:core/Int";

module {
  public type OfficialUpdate = Types.OfficialUpdate;
  public type UpdateCategory = Types.UpdateCategory;

  public func getById(store : Map.Map<Text, OfficialUpdate>, id : Text) : ?OfficialUpdate {
    store.get(id);
  };

  public func create(store : Map.Map<Text, OfficialUpdate>, item : OfficialUpdate) {
    store.add(item.id, item);
  };

  public func update(store : Map.Map<Text, OfficialUpdate>, item : OfficialUpdate) {
    store.add(item.id, item);
  };

  public func deactivate(store : Map.Map<Text, OfficialUpdate>, id : Text) {
    switch (store.get(id)) {
      case (?item) { store.add(id, { item with isActive = false }) };
      case null {};
    };
  };

  public func delete(store : Map.Map<Text, OfficialUpdate>, id : Text) {
    store.remove(id);
  };

  // Returns active items sorted by date descending (newest first)
  public func listActive(store : Map.Map<Text, OfficialUpdate>) : [OfficialUpdate] {
    let items = store.values().filter(func(item : OfficialUpdate) : Bool { item.isActive }).toArray();
    items.sort(func(a : OfficialUpdate, b : OfficialUpdate) : { #less; #equal; #greater } {
      Int.compare(b.date, a.date)
    })
  };

  public func listAll(store : Map.Map<Text, OfficialUpdate>) : [OfficialUpdate] {
    let items = store.values().toArray();
    items.sort(func(a : OfficialUpdate, b : OfficialUpdate) : { #less; #equal; #greater } {
      Int.compare(b.date, a.date)
    })
  };

  public func listByCategory(store : Map.Map<Text, OfficialUpdate>, category : UpdateCategory) : [OfficialUpdate] {
    let items = store.values().filter(func(item : OfficialUpdate) : Bool {
      item.isActive and item.category == category
    }).toArray();
    items.sort(func(a : OfficialUpdate, b : OfficialUpdate) : { #less; #equal; #greater } {
      Int.compare(b.date, a.date)
    })
  };
};
