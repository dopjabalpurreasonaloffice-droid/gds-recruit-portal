import AdminLib "../lib/admin";
import Map "mo:core/Map";

mixin (
  adminCandidates : Map.Map<AdminLib.AdminCandidateId, AdminLib.AdminCandidate>
) {

  // ─── Candidate Login ──────────────────────────────────────────────────────────

  // Verifies email + default password ("Dop@123") against adminCandidatesV2; returns token on match
  public shared func candidateLogin(
    email : Text,
    password : Text
  ) : async { #ok : AdminLib.CandidateLoginResult; #err : Text } {
    AdminLib.candidateLogin(adminCandidates, email, password)
  };

  // Returns full candidate record for profile display after login (lookup by registrationNo)
  public query func getCandidateProfile(
    registrationNo : Text
  ) : async ?AdminLib.AdminCandidate {
    AdminLib.getCandidateProfileByRegNo(adminCandidates, registrationNo)
  };

  // Returns registrationNo for a given email — used by frontend after login to store regNo
  public query func getCandidateByEmail(
    email : Text
  ) : async ?Text {
    AdminLib.getCandidateByEmail(adminCandidates, email)
  };
};
