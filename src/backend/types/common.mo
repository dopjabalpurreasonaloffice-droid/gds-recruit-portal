module {
  // Scalar aliases
  public type UserId = Nat;
  public type ApplicationId = Nat;
  public type PaymentId = Nat;
  public type NotificationId = Nat;
  public type CircleId = Nat;
  public type CandidateId = Nat;
  public type Timestamp = Int;

  // ─── Enums ──────────────────────────────────────────────────────────────────

  public type UserRole = {
    #admin;
    #applicant;
  };

  public type ApplicationStatus = {
    #draft;
    #submitted;
    #underReview;
    #shortlisted;
    #rejected;
  };

  public type PaymentStatus = {
    #pending;
    #success;
    #failed;
    #notRequired;
  };

  public type PaymentMethod = {
    #card;
    #upi;
    #netbanking;
  };

  public type NotifType = {
    #general;
    #important;
    #urgent;
  };

  public type UpdateCategory = {
    #officialLetter;
    #tender;
    #recruitment;
  };

  public type OfficialUpdate = {
    id : Text;
    title : Text;
    content : Text;
    category : UpdateCategory;
    date : Timestamp;
    pdfUrl : ?Text;
    isNew : Bool;
    isActive : Bool;
    createdBy : Text;
  };

  // ─── Value Objects ───────────────────────────────────────────────────────────

  public type AddressType = {
    doorNo : Text;
    street : Text;
    city : Text;
    district : Text;
    state : Text;
    pincode : Text;
  };

  public type EducationDetails = {
    boardName : Text;
    yearOfPassing : Text;
    totalMarks : Nat;
    marksObtained : Nat;
    percentage : Float;
  };

  public type Preferences = {
    state : Text;
    circle : Text;
    division : Text;
    postCategory : Text;
  };

  // ─── Core Entities ───────────────────────────────────────────────────────────

  public type User = {
    id : UserId;
    principal : Principal;
    name : Text;
    mobile : Text;
    email : Text;
    aadhaar : Text;
    dob : Text;
    gender : Text;
    category : Text;
    subcategory : Text;
    address : AddressType;
    photoUrl : ?Text;
    signatureUrl : ?Text;
    role : UserRole;
    isVerified : Bool;
    createdAt : Timestamp;
  };

  public type OTPRecord = {
    id : Nat;
    contact : Text;
    code : Text;
    expiresAt : Timestamp;
    verified : Bool;
  };

  public type Application = {
    id : ApplicationId;
    userId : UserId;
    educationDetails : EducationDetails;
    preferences : Preferences;
    documentUrls : [Text];
    status : ApplicationStatus;
    paymentStatus : PaymentStatus;
    submittedAt : ?Timestamp;
    createdAt : Timestamp;
  };

  public type Payment = {
    id : PaymentId;
    applicationId : ApplicationId;
    userId : UserId;
    amount : Nat;
    method : PaymentMethod;
    transactionId : Text;
    status : PaymentStatus;
    createdAt : Timestamp;
  };

  public type Notification = {
    id : NotificationId;
    title : Text;
    content : Text;
    notifType : NotifType;
    date : Timestamp;
    isActive : Bool;
    createdBy : UserId;
  };

  public type Post = {
    category : Text;
    totalPosts : Nat;
    urPosts : Nat;
    obcPosts : Nat;
    scPosts : Nat;
    stPosts : Nat;
  };

  public type Division = {
    id : Nat;
    name : Text;
    posts : [Post];
  };

  public type Circle = {
    id : CircleId;
    stateName : Text;
    circleName : Text;
    divisions : [Division];
  };

  public type ShortlistedCandidate = {
    id : CandidateId;
    applicationId : ApplicationId;
    candidateName : Text;
    rollNumber : Text;
    state : Text;
    circle : Text;
    division : Text;
    category : Text;
    rank : Nat;
  };
};
