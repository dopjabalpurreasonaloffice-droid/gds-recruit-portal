module {
  // ─── Scalar Aliases ──────────────────────────────────────────────────────────

  public type AdminCandidateId = Nat;
  public type DocumentId = Nat;
  public type VacancyId = Nat;

  // ─── Enums ───────────────────────────────────────────────────────────────────

  public type AdminCandidateStatus = {
    #Pending;
    #Approved;
    #Rejected;
    #Verified;
  };

  public type FeeStatus = {
    #Pending;
    #Paid;
    #Failed;
  };

  public type DocumentType = {
    #RegistrationForm;
    #Aadhaar;
    #PanCard;
    #TenthCertificate;
    #TwelfthCertificate;
    #CasteCertificate;
    #Domicile;
    #IncomeCertificate;
    #ComputerCertificate;
    #IdentityCertificate;
    #CharacterCertificate;
    #MedicalCertificate;
    #AttestationForm;
    #Photo;
    #Signature;
  };

  public type ResultType = {
    #Percentage;
    #CGPA;
    #GradePoint;
  };

  public type PostPreference = {
    preferenceNo : Nat;
    branchOfficeName : Text;
    postType : Text; // "BPM" or "ABPM"
    category : Text; // "UR" / "OBC" / "SC" / "ST" / "EWS"
    basicPay : Nat;  // 12000 or 10000
  };

  public type SubjectMark = {
    subject : Text;
    marksOrGrade : Text;
  };

  public type AddressInfo = {
    doorNo : Text;
    street : Text;
    village : Text;
    district : Text;
    state : Text;
    pincode : Text;
  };

  // ─── Candidate Auth ──────────────────────────────────────────────────────────

  public type CandidateLoginResult = {
    token : Text;
    registrationNo : Text;
    name : Text;
    mobile : Text;
    status : AdminCandidateStatus;
  };

  // ─── Full Registration Candidate ─────────────────────────────────────────────

  public type AdminCandidate = {
    id : AdminCandidateId;
    registrationNo : Text;
    // Personal Details
    name : Text;
    fatherName : Text;
    mobile : Text;
    email : Text;
    aadhaar : Text;
    dob : Text;
    gender : Text;
    category : Text;
    ph : Bool;
    canRideBicycle : Bool;
    isEmployed : Bool;
    nocAvailable : Bool;
    // Address
    presentAddress : AddressInfo;
    permanentAddress : AddressInfo;
    // Education
    boardName : Text;
    stateOfBoard : Text;
    yearOfPassing : Text;
    resultType : ResultType;
    subjectMarks : [SubjectMark];
    totalCgpa : Text;
    totalGrade : Text;
    percentageObtained : Text;
    boardRemarks : Text;
    // Declarations
    declarationsAccepted : Bool;
    // Post Preferences
    postPreferences : [PostPreference];
    divisionForVerification : Text;
    // Files (stored as path strings)
    photoPath : Text;
    signaturePath : Text;
    // Status
    status : AdminCandidateStatus;
    rejectionReason : Text;
    feeStatus : FeeStatus;
    circle : Text;
    division : Text;
    createdAt : Int;
    updatedAt : Int;
    applicationFormData : ?Text;
  };

  public type Document = {
    id : DocumentId;
    candidateId : AdminCandidateId;
    registrationNo : Text;
    documentType : DocumentType;
    fileKey : Text;
    fileName : Text;
    uploadedAt : Int;
  };

  // Enhanced Vacancy with branch-office level granularity
  public type Vacancy = {
    id : VacancyId;
    circle : Text;
    division : Text;
    branchOfficeName : Text;
    postType : Text;   // "BPM" or "ABPM"
    category : Text;   // "UR" / "OBC" / "SC" / "ST" / "EWS"
    basicPay : Nat;    // 12000 or 10000
    totalSeats : Nat;
    filledSeats : Nat;
    isActive : Bool;
    createdAt : Int;
  };
};
