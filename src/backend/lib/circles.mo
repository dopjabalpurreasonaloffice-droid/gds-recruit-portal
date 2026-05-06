import Types "../types/common";
import Map "mo:core/Map";
import Set "mo:core/Set";

module {
  public type Circle = Types.Circle;
  public type CircleId = Types.CircleId;
  public type Division = Types.Division;
  public type Post = Types.Post;

  public func getById(circles : Map.Map<CircleId, Circle>, id : CircleId) : ?Circle {
    circles.get(id);
  };

  public func getByState(circles : Map.Map<CircleId, Circle>, stateName : Text) : [Circle] {
    circles.values().filter(func(c : Circle) : Bool { c.stateName == stateName }).toArray()
  };

  public func create(circles : Map.Map<CircleId, Circle>, circle : Circle) : () {
    circles.add(circle.id, circle);
  };

  public func update(circles : Map.Map<CircleId, Circle>, circle : Circle) : () {
    circles.add(circle.id, circle);
  };

  public func delete(circles : Map.Map<CircleId, Circle>, id : CircleId) : () {
    circles.remove(id);
  };

  public func listAll(circles : Map.Map<CircleId, Circle>) : [Circle] {
    circles.values().toArray();
  };

  public func listStates(circles : Map.Map<CircleId, Circle>) : [Text] {
    let stateSet = Set.empty<Text>();
    circles.forEach(func(_, c) { stateSet.add(c.stateName) });
    stateSet.values().toArray();
  };
};
