import AdminTypes "../types/admin";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type AdminCandidateId = AdminTypes.AdminCandidateId;
  public type DocumentId = AdminTypes.DocumentId;
  public type VacancyId = AdminTypes.VacancyId;
  public type AdminCandidate = AdminTypes.AdminCandidate;
  public type Document = AdminTypes.Document;
  public type Vacancy = AdminTypes.Vacancy;
  public type AdminCandidateStatus = AdminTypes.AdminCandidateStatus;
  public type FeeStatus = AdminTypes.FeeStatus;
  public type DocumentType = AdminTypes.DocumentType;
  public type ResultType = AdminTypes.ResultType;
  public type PostPreference = AdminTypes.PostPreference;
  public type SubjectMark = AdminTypes.SubjectMark;
  public type AddressInfo = AdminTypes.AddressInfo;
  public type CandidateLoginResult = AdminTypes.CandidateLoginResult;

  // ─── HR Registration Series ───────────────────────────────────────────────────

  let hrSeries : [Text] = [
    "HR05AEDAD97D85",
    "HR04AEA77DF55",
    "HR65AEAAS34S67",
    "HR69AEAGHS84S52",
    "HR96RFF5H67T4S31",
    "HR96LK32T5SN45",
    "HR04AEDAD87D84",
    "HR04AEDGL87D65",
    "HR04AEDAD87D93",
    "HR04AEDAD87D39",
    "HR98RSF7H69T4S21",
    "HR97RSF7H69T4S52",
    "HR99RSF7H69T4S86",
    "HR56RFF7H69T4S09",
    "HR98RFF7H69T4S32",
    "HR99RCF7H54T05",
    "HR99EDG5V78P91",
  ];

  // ─── Admin Credential Verification ──────────────────────────────────────────

  public func verifyAdminCredentials(username : Text, password : Text) : Bool {
    username == "jbpinsp481666" and password == "jbpadmin$07@12"
  };

  // ─── Token Generation (simulated JWT — JSON payload, frontend parses expiry) ──

  public func generateToken(username : Text) : Text {
    // 24h expiry in nanoseconds from now. Frontend parses this JSON directly.
    let expiryNs : Int = Time.now() + 86_400_000_000_000;
    "{\"username\":\"" # username # "\",\"exp\":" # debug_show(expiryNs) # "}"
  };

  // ─── Registration Number Generation ─────────────────────────────────────────

  // Generates a registration number from the 17 HR series using count as index,
  // appending a suffix counter when series is exhausted.
  public func generateRegistrationNo(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>
  ) : Text {
    let count = adminCandidates.size();
    let seriesLen = hrSeries.size();
    let idx = count % seriesLen;
    let cycle = count / seriesLen;
    let base = hrSeries[idx];
    if (cycle == 0) {
      base
    } else {
      base # "-" # cycle.toText()
    }
  };

  // ─── Candidate Operations ────────────────────────────────────────────────────

  public func addAdminCandidate(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
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
    presentAddress : AddressInfo,
    permanentAddress : AddressInfo,
    boardName : Text,
    stateOfBoard : Text,
    yearOfPassing : Text,
    resultType : ResultType,
    subjectMarks : [SubjectMark],
    totalCgpa : Text,
    totalGrade : Text,
    percentageObtained : Text,
    boardRemarks : Text,
    declarationsAccepted : Bool,
    postPreferences : [PostPreference],
    divisionForVerification : Text,
    photoPath : Text,
    signaturePath : Text,
    circle : Text,
    division : Text,
    overrideRegistrationNo : ?Text
  ) : AdminCandidate {
    let id = adminCandidates.size() + 1;
    let registrationNo = switch (overrideRegistrationNo) {
      case (?r) if (r.size() > 0) r else generateRegistrationNo(adminCandidates);
      case null generateRegistrationNo(adminCandidates);
    };
    let now = Time.now();
    let candidate : AdminCandidate = {
      id = id;
      registrationNo = registrationNo;
      name = name;
      fatherName = fatherName;
      mobile = mobile;
      email = email.toLower();
      aadhaar = aadhaar;
      dob = dob;
      gender = gender;
      category = category;
      ph = ph;
      canRideBicycle = canRideBicycle;
      isEmployed = isEmployed;
      nocAvailable = nocAvailable;
      presentAddress = presentAddress;
      permanentAddress = permanentAddress;
      boardName = boardName;
      stateOfBoard = stateOfBoard;
      yearOfPassing = yearOfPassing;
      resultType = resultType;
      subjectMarks = subjectMarks;
      totalCgpa = totalCgpa;
      totalGrade = totalGrade;
      percentageObtained = percentageObtained;
      boardRemarks = boardRemarks;
      declarationsAccepted = declarationsAccepted;
      postPreferences = postPreferences;
      divisionForVerification = divisionForVerification;
      photoPath = photoPath;
      signaturePath = signaturePath;
      status = #Pending;
      rejectionReason = "";
      feeStatus = #Pending;
      circle = circle;
      division = division;
      createdAt = now;
      updatedAt = now;
      applicationFormData = null;
    };
    adminCandidates.add(id, candidate);
    candidate
  };

  public func getAdminCandidateById(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    id : AdminCandidateId
  ) : ?AdminCandidate {
    adminCandidates.get(id)
  };

  public func getAllAdminCandidates(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    circle : ?Text,
    division : ?Text,
    status : ?AdminCandidateStatus
  ) : [AdminCandidate] {
    adminCandidates.values().filter(func(c) {
      let circleMatch = switch (circle) {
        case null true;
        case (?ci) c.circle == ci;
      };
      let divisionMatch = switch (division) {
        case null true;
        case (?di) c.division == di;
      };
      let statusMatch = switch (status) {
        case null true;
        case (?st) c.status == st;
      };
      circleMatch and divisionMatch and statusMatch
    }).toArray()
  };

  public func updateCandidateStatus(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    id : AdminCandidateId,
    status : AdminCandidateStatus,
    rejectionReason : ?Text
  ) : ?AdminCandidate {
    switch (adminCandidates.get(id)) {
      case null null;
      case (?existing) {
        let reason = switch (rejectionReason) {
          case null "";
          case (?r) r;
        };
        let updated : AdminCandidate = {
          existing with
          status = status;
          rejectionReason = reason;
          updatedAt = Time.now();
        };
        adminCandidates.add(id, updated);
        ?updated
      };
    }
  };

  public func updateFeeStatus(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    id : AdminCandidateId,
    feeStatus : FeeStatus
  ) : ?AdminCandidate {
    switch (adminCandidates.get(id)) {
      case null null;
      case (?existing) {
        let updated : AdminCandidate = { existing with feeStatus = feeStatus; updatedAt = Time.now() };
        adminCandidates.add(id, updated);
        ?updated
      };
    }
  };

  public func getCandidatesByRegistrationNo(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    registrationNo : Text
  ) : [AdminCandidate] {
    adminCandidates.values().filter(func(c) { c.registrationNo == registrationNo }).toArray()
  };

  public func setApplicationFormData(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    registrationNo : Text,
    formData : Text
  ) : { #ok; #err : Text } {
    let found = adminCandidates.values().find(func(c) { c.registrationNo == registrationNo });
    switch (found) {
      case null { #err("Candidate not found") };
      case (?existing) {
        let updated : AdminCandidate = { existing with applicationFormData = ?formData; updatedAt = Time.now() };
        adminCandidates.add(existing.id, updated);
        #ok
      };
    }
  };

  // ─── Dashboard Stats ─────────────────────────────────────────────────────────

  public func computeDashboard(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>
  ) : {
    totalCandidates : Nat;
    approved : Nat;
    rejected : Nat;
    pending : Nat;
    circleStats : [(Text, Nat)];
    divisionStats : [(Text, Nat)];
  } {
    var total = 0;
    var approved = 0;
    var rejected = 0;
    var pending = 0;
    let circleMap = Map.empty<Text, Nat>();
    let divisionMap = Map.empty<Text, Nat>();

    adminCandidates.values().forEach(func(c) {
      total += 1;
      switch (c.status) {
        case (#Approved) { approved += 1 };
        case (#Rejected) { rejected += 1 };
        case (#Pending)  { pending += 1 };
        case (#Verified) { approved += 1 };
      };
      let prevCircle = switch (circleMap.get(c.circle)) { case null 0; case (?n) n };
      circleMap.add(c.circle, prevCircle + 1);
      let prevDiv = switch (divisionMap.get(c.division)) { case null 0; case (?n) n };
      divisionMap.add(c.division, prevDiv + 1);
    });

    {
      totalCandidates = total;
      approved = approved;
      rejected = rejected;
      pending = pending;
      circleStats = circleMap.entries().toArray();
      divisionStats = divisionMap.entries().toArray();
    }
  };

  // ─── Document Operations ─────────────────────────────────────────────────────

  public func addDocument(
    documents : Map.Map<DocumentId, Document>,
    candidateId : AdminCandidateId,
    registrationNo : Text,
    documentType : DocumentType,
    fileKey : Text,
    fileName : Text
  ) : Document {
    let id = documents.size() + 1;
    let doc : Document = {
      id = id;
      candidateId = candidateId;
      registrationNo = registrationNo;
      documentType = documentType;
      fileKey = fileKey;
      fileName = fileName;
      uploadedAt = Time.now();
    };
    documents.add(id, doc);
    doc
  };

  public func getDocumentsByCandidateId(
    documents : Map.Map<DocumentId, Document>,
    candidateId : AdminCandidateId
  ) : [Document] {
    documents.values().filter(func(d) { d.candidateId == candidateId }).toArray()
  };

  public func deleteDocument(
    documents : Map.Map<DocumentId, Document>,
    id : DocumentId
  ) : Bool {
    switch (documents.get(id)) {
      case null false;
      case (?_) {
        documents.remove(id);
        true
      };
    }
  };

  // ─── Vacancy Operations ──────────────────────────────────────────────────────

  public func addVacancy(
    vacancies : Map.Map<VacancyId, Vacancy>,
    circle : Text,
    division : Text,
    branchOfficeName : Text,
    postType : Text,
    category : Text,
    basicPay : Nat,
    totalSeats : Nat
  ) : Vacancy {
    let id = vacancies.size() + 1;
    let vacancy : Vacancy = {
      id = id;
      circle = circle;
      division = division;
      branchOfficeName = branchOfficeName;
      postType = postType;
      category = category;
      basicPay = basicPay;
      totalSeats = totalSeats;
      filledSeats = 0;
      isActive = true;
      createdAt = Time.now();
    };
    vacancies.add(id, vacancy);
    vacancy
  };

  public func getAllVacancies(
    vacancies : Map.Map<VacancyId, Vacancy>,
    division : ?Text
  ) : [Vacancy] {
    switch (division) {
      case null {
        vacancies.values().toArray()
      };
      case (?div) {
        vacancies.values().filter(func(v) { v.division == div }).toArray()
      };
    }
  };

  public func getActiveVacancies(
    vacancies : Map.Map<VacancyId, Vacancy>,
    division : ?Text
  ) : [Vacancy] {
    vacancies.values().filter(func(v) {
      v.isActive and v.filledSeats < v.totalSeats and
      (switch (division) { case null true; case (?d) v.division == d })
    }).toArray()
  };

  public func updateVacancy(
    vacancies : Map.Map<VacancyId, Vacancy>,
    id : VacancyId,
    totalSeats : Nat,
    isActive : Bool
  ) : ?Vacancy {
    switch (vacancies.get(id)) {
      case null null;
      case (?existing) {
        let updated : Vacancy = { existing with totalSeats = totalSeats; isActive = isActive };
        vacancies.add(id, updated);
        ?updated
      };
    }
  };

  public func deleteVacancy(
    vacancies : Map.Map<VacancyId, Vacancy>,
    id : VacancyId
  ) : Bool {
    switch (vacancies.get(id)) {
      case null false;
      case (?_) {
        vacancies.remove(id);
        true
      };
    }
  };

  public func incrementFilledSeats(
    vacancies : Map.Map<VacancyId, Vacancy>,
    division : Text,
    branchOfficeName : Text,
    postType : Text
  ) {
    let found = vacancies.values().find(func(v) {
      v.division == division and v.branchOfficeName == branchOfficeName and v.postType == postType
    });
    switch (found) {
      case null {};
      case (?v) {
        if (v.filledSeats < v.totalSeats) {
          vacancies.add(v.id, { v with filledSeats = v.filledSeats + 1 });
        };
      };
    };
  };

  // ─── Candidate Auth ──────────────────────────────────────────────────────────

  // Generates a candidate session token (JSON payload with registrationNo + 24h expiry)
  public func generateCandidateToken(registrationNo : Text) : Text {
    let expiryNs : Int = Time.now() + 86_400_000_000_000;
    "{\"registrationNo\":\"" # registrationNo # "\",\"exp\":" # debug_show(expiryNs) # "}"
  };

  let defaultCandidatePassword : Text = "Dop@123";

  // Looks up candidate by email (case-insensitive), verifies password == default, returns login result or error
  public func candidateLogin(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    email : Text,
    password : Text
  ) : { #ok : CandidateLoginResult; #err : Text } {
    let emailLower = email.toLower();
    let found = adminCandidates.values().find(func(c) { c.email.toLower() == emailLower });
    switch (found) {
      case null { #err("Invalid email or password") };
      case (?c) {
        if (password != defaultCandidatePassword) {
          #err("Invalid email or password")
        } else {
          let token = generateCandidateToken(c.registrationNo);
          #ok({
            token = token;
            registrationNo = c.registrationNo;
            name = c.name;
            mobile = c.mobile;
            status = c.status;
          })
        }
      };
    }
  };

  // Returns registrationNo for a given email (case-insensitive lookup)
  public func getCandidateByEmail(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    email : Text
  ) : ?Text {
    let emailLower = email.toLower();
    let found = adminCandidates.values().find(func(c) { c.email.toLower() == emailLower });
    switch (found) {
      case null null;
      case (?c) ?c.registrationNo;
    }
  };

  // Returns full candidate record for profile display (lookup by registrationNo)
  public func getCandidateProfileByRegNo(
    adminCandidates : Map.Map<AdminCandidateId, AdminCandidate>,
    registrationNo : Text
  ) : ?AdminCandidate {
    adminCandidates.values().find(func(c) { c.registrationNo == registrationNo })
  };
};
