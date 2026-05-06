import Types "../types/common";
import Map "mo:core/Map";

module {
  public type ShortlistedCandidate = Types.ShortlistedCandidate;
  public type CandidateId = Types.CandidateId;

  public func getById(candidates : Map.Map<CandidateId, ShortlistedCandidate>, id : CandidateId) : ?ShortlistedCandidate {
    candidates.get(id);
  };

  public func getByState(candidates : Map.Map<CandidateId, ShortlistedCandidate>, stateName : Text) : [ShortlistedCandidate] {
    candidates.values().filter(func(c : ShortlistedCandidate) : Bool { c.state == stateName }).toArray()
  };

  public func getByCircle(candidates : Map.Map<CandidateId, ShortlistedCandidate>, circle : Text) : [ShortlistedCandidate] {
    candidates.values().filter(func(c : ShortlistedCandidate) : Bool { c.circle == circle }).toArray()
  };

  public func create(candidates : Map.Map<CandidateId, ShortlistedCandidate>, candidate : ShortlistedCandidate) : () {
    candidates.add(candidate.id, candidate);
  };

  public func delete(candidates : Map.Map<CandidateId, ShortlistedCandidate>, id : CandidateId) : () {
    candidates.remove(id);
  };

  public func listAll(candidates : Map.Map<CandidateId, ShortlistedCandidate>) : [ShortlistedCandidate] {
    candidates.values().toArray();
  };
};
