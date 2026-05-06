import AdminTypes "../types/admin";
import AdminLib "../lib/admin";
import Map "mo:core/Map";

mixin (
  adminCandidates : Map.Map<AdminLib.AdminCandidateId, AdminLib.AdminCandidate>,
  adminDocuments : Map.Map<AdminLib.DocumentId, AdminLib.Document>,
  adminVacancies : Map.Map<AdminLib.VacancyId, AdminLib.Vacancy>
) {

  // ─── Auth ─────────────────────────────────────────────────────────────────────

  public shared func adminLogin(
    username : Text,
    password : Text
  ) : async { #ok : Text; #err : Text } {
    if (AdminLib.verifyAdminCredentials(username, password)) {
      let token = AdminLib.generateToken(username);
      #ok(token)
    } else {
      #err("Invalid username or password")
    }
  };

  // ─── Dashboard ────────────────────────────────────────────────────────────────

  public query func adminGetDashboard() : async {
    totalCandidates : Nat;
    approved : Nat;
    rejected : Nat;
    pending : Nat;
    circleStats : [(Text, Nat)];
    divisionStats : [(Text, Nat)];
  } {
    AdminLib.computeDashboard(adminCandidates)
  };

  // ─── Candidate Management ─────────────────────────────────────────────────────

  public shared func adminRegisterCandidate(
    name : Text,
    fatherName : Text,
    mobile : Text,
    email : Text,
    aadhaar : Text,
    dob : Text,
    gender : Text,
    category : Text,
    ph : Bool,
    canRideBicycle : Bool,
    isEmployed : Bool,
    nocAvailable : Bool,
    presentAddress : AdminLib.AddressInfo,
    permanentAddress : AdminLib.AddressInfo,
    boardName : Text,
    stateOfBoard : Text,
    yearOfPassing : Text,
    resultType : AdminLib.ResultType,
    subjectMarks : [AdminLib.SubjectMark],
    totalCgpa : Text,
    totalGrade : Text,
    percentageObtained : Text,
    boardRemarks : Text,
    declarationsAccepted : Bool,
    postPreferences : [AdminLib.PostPreference],
    divisionForVerification : Text,
    photoPath : Text,
    signaturePath : Text,
    circle : Text,
    division : Text,
    overrideRegistrationNo : ?Text
  ) : async { #ok : AdminLib.AdminCandidate; #err : Text } {
    let candidate = AdminLib.addAdminCandidate(
      adminCandidates,
      name, fatherName, mobile, email, aadhaar, dob, gender, category,
      ph, canRideBicycle, isEmployed, nocAvailable,
      presentAddress, permanentAddress,
      boardName, stateOfBoard, yearOfPassing, resultType,
      subjectMarks, totalCgpa, totalGrade, percentageObtained, boardRemarks,
      declarationsAccepted, postPreferences, divisionForVerification,
      photoPath, signaturePath, circle, division,
      overrideRegistrationNo
    );
    // Increment filled seats for all post preferences
    for (pref in postPreferences.vals()) {
      AdminLib.incrementFilledSeats(adminVacancies, division, pref.branchOfficeName, pref.postType);
    };
    #ok(candidate)
  };

  public query func adminGetAllCandidates(
    circle : ?Text,
    division : ?Text,
    status : ?AdminLib.AdminCandidateStatus
  ) : async [AdminLib.AdminCandidate] {
    AdminLib.getAllAdminCandidates(adminCandidates, circle, division, status)
  };

  public query func adminGetCandidate(
    id : AdminLib.AdminCandidateId
  ) : async ?AdminLib.AdminCandidate {
    AdminLib.getAdminCandidateById(adminCandidates, id)
  };

  public shared func adminUpdateCandidateStatus(
    id : AdminLib.AdminCandidateId,
    status : AdminLib.AdminCandidateStatus,
    rejectionReason : ?Text
  ) : async { #ok : AdminLib.AdminCandidate; #err : Text } {
    switch (AdminLib.updateCandidateStatus(adminCandidates, id, status, rejectionReason)) {
      case null { #err("Candidate not found") };
      case (?updated) { #ok(updated) };
    }
  };

  public shared func adminUpdateFeeStatus(
    candidateId : AdminLib.AdminCandidateId,
    feeStatus : AdminLib.FeeStatus
  ) : async { #ok : AdminLib.AdminCandidate; #err : Text } {
    switch (AdminLib.updateFeeStatus(adminCandidates, candidateId, feeStatus)) {
      case null { #err("Candidate not found") };
      case (?updated) { #ok(updated) };
    }
  };

  public query func adminGetCandidatesByRegistrationNo(
    registrationNo : Text
  ) : async [AdminLib.AdminCandidate] {
    AdminLib.getCandidatesByRegistrationNo(adminCandidates, registrationNo)
  };

  public shared func adminSetCandidateApplicationForm(
    registrationNo : Text,
    formData : Text
  ) : async { #ok : (); #err : Text } {
    switch (AdminLib.setApplicationFormData(adminCandidates, registrationNo, formData)) {
      case (#ok) { #ok(()) };
      case (#err(e)) { #err(e) };
    }
  };

  // ─── Document Management ──────────────────────────────────────────────────────

  public shared func adminAddDocument(
    candidateId : AdminLib.AdminCandidateId,
    registrationNo : Text,
    documentType : AdminLib.DocumentType,
    fileKey : Text,
    fileName : Text
  ) : async { #ok : AdminLib.Document; #err : Text } {
    let doc = AdminLib.addDocument(adminDocuments, candidateId, registrationNo, documentType, fileKey, fileName);
    #ok(doc)
  };

  public query func adminGetDocuments(
    candidateId : AdminLib.AdminCandidateId
  ) : async [AdminLib.Document] {
    AdminLib.getDocumentsByCandidateId(adminDocuments, candidateId)
  };

  public shared func adminDeleteDocument(
    id : AdminLib.DocumentId
  ) : async { #ok : (); #err : Text } {
    if (AdminLib.deleteDocument(adminDocuments, id)) {
      #ok(())
    } else {
      #err("Document not found")
    }
  };

  // ─── Vacancy Management ───────────────────────────────────────────────────────

  public shared func adminAddVacancy(
    circle : Text,
    division : Text,
    branchOfficeName : Text,
    postType : Text,
    category : Text,
    basicPay : Nat,
    totalSeats : Nat
  ) : async { #ok : AdminLib.Vacancy; #err : Text } {
    let vacancy = AdminLib.addVacancy(adminVacancies, circle, division, branchOfficeName, postType, category, basicPay, totalSeats);
    #ok(vacancy)
  };

  public query func adminGetAllVacancies(
    division : ?Text
  ) : async [AdminLib.Vacancy] {
    AdminLib.getAllVacancies(adminVacancies, division)
  };

  public query func adminGetActiveVacancies(
    division : ?Text
  ) : async [AdminLib.Vacancy] {
    AdminLib.getActiveVacancies(adminVacancies, division)
  };

  public shared func adminUpdateVacancy(
    id : AdminLib.VacancyId,
    totalSeats : Nat,
    isActive : Bool
  ) : async { #ok : AdminLib.Vacancy; #err : Text } {
    switch (AdminLib.updateVacancy(adminVacancies, id, totalSeats, isActive)) {
      case null { #err("Vacancy not found") };
      case (?updated) { #ok(updated) };
    }
  };

  public shared func adminDeleteVacancy(
    id : AdminLib.VacancyId
  ) : async { #ok : (); #err : Text } {
    if (AdminLib.deleteVacancy(adminVacancies, id)) {
      #ok(())
    } else {
      #err("Vacancy not found")
    }
  };
};
