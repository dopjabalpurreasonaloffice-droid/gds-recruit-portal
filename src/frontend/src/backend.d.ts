import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AddressInfo {
    street: string;
    doorNo: string;
    district: string;
    state: string;
    village: string;
    pincode: string;
}
export type Timestamp = bigint;
export interface EducationDetails {
    totalMarks: bigint;
    marksObtained: bigint;
    yearOfPassing: string;
    boardName: string;
    percentage: number;
}
export interface Circle {
    id: CircleId;
    stateName: string;
    divisions: Array<Division>;
    circleName: string;
}
export interface Application {
    id: ApplicationId;
    status: ApplicationStatus;
    documentUrls: Array<string>;
    paymentStatus: PaymentStatus;
    userId: UserId;
    createdAt: Timestamp;
    submittedAt?: Timestamp;
    educationDetails: EducationDetails;
    preferences: Preferences;
}
export type VacancyId = bigint;
export interface Document {
    id: DocumentId;
    documentType: DocumentType;
    fileName: string;
    registrationNo: string;
    candidateId: AdminCandidateId;
    uploadedAt: bigint;
    fileKey: string;
}
export interface Division {
    id: bigint;
    name: string;
    posts: Array<Post>;
}
export type AdminCandidateId = bigint;
export interface SubjectMark {
    subject: string;
    marksOrGrade: string;
}
export interface Post {
    stPosts: bigint;
    scPosts: bigint;
    obcPosts: bigint;
    category: string;
    totalPosts: bigint;
    urPosts: bigint;
}
export type DocumentId = bigint;
export interface AdminCandidate {
    id: AdminCandidateId;
    ph: boolean;
    dob: string;
    subjectMarks: Array<SubjectMark>;
    isEmployed: boolean;
    status: AdminCandidateStatus;
    divisionForVerification: string;
    photoPath: string;
    postPreferences: Array<PostPreference>;
    percentageObtained: string;
    canRideBicycle: boolean;
    feeStatus: FeeStatus;
    name: string;
    createdAt: bigint;
    rejectionReason: string;
    division: string;
    circle: string;
    totalCgpa: string;
    aadhaar: string;
    declarationsAccepted: boolean;
    email: string;
    permanentAddress: AddressInfo;
    updatedAt: bigint;
    yearOfPassing: string;
    signaturePath: string;
    fatherName: string;
    nocAvailable: boolean;
    gender: string;
    totalGrade: string;
    boardName: string;
    category: string;
    resultType: ResultType;
    mobile: string;
    registrationNo: string;
    stateOfBoard: string;
    boardRemarks: string;
    presentAddress: AddressInfo;
    applicationFormData?: string;
}
export type CircleId = bigint;
export interface Vacancy {
    id: VacancyId;
    postType: string;
    branchOfficeName: string;
    createdAt: bigint;
    division: string;
    circle: string;
    basicPay: bigint;
    isActive: boolean;
    totalSeats: bigint;
    category: string;
    filledSeats: bigint;
}
export interface AddressType {
    street: string;
    doorNo: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
}
export interface User {
    id: UserId;
    dob: string;
    principal: Principal;
    subcategory: string;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    photoUrl?: string;
    aadhaar: string;
    email: string;
    isVerified: boolean;
    signatureUrl?: string;
    address: AddressType;
    gender: string;
    category: string;
    mobile: string;
}
export interface Preferences {
    postCategory: string;
    division: string;
    circle: string;
    state: string;
}
export interface Payment {
    id: PaymentId;
    status: PaymentStatus;
    method: PaymentMethod;
    applicationId: ApplicationId;
    userId: UserId;
    createdAt: Timestamp;
    amount: bigint;
    transactionId: string;
}
export interface CandidateLoginResult {
    status: AdminCandidateStatus;
    token: string;
    name: string;
    mobile: string;
    registrationNo: string;
}
export interface HttpHeader {
    value: string;
    name: string;
}
export interface PostPreference {
    postType: string;
    preferenceNo: bigint;
    branchOfficeName: string;
    basicPay: bigint;
    category: string;
}
export type UserId = bigint;
export type CandidateId = bigint;
export interface ShortlistedCandidate {
    id: CandidateId;
    applicationId: ApplicationId;
    rank: bigint;
    division: string;
    circle: string;
    state: string;
    rollNumber: string;
    category: string;
    candidateName: string;
}
export type PaymentId = bigint;
export type NotificationId = bigint;
export interface Notification {
    id: NotificationId;
    title: string;
    content: string;
    notifType: NotifType;
    date: Timestamp;
    createdBy: UserId;
    isActive: boolean;
}
export interface HttpResponse {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export type ApplicationId = bigint;
export interface OfficialUpdate {
    id: string;
    title: string;
    content: string;
    date: Timestamp;
    createdBy: string;
    isActive: boolean;
    pdfUrl?: string;
    category: UpdateCategory;
    isNew: boolean;
}
export enum AdminCandidateStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Verified = "Verified",
    Pending = "Pending"
}
export enum ApplicationStatus {
    submitted = "submitted",
    underReview = "underReview",
    rejected = "rejected",
    shortlisted = "shortlisted",
    draft = "draft"
}
export enum DocumentType {
    TenthCertificate = "TenthCertificate",
    Aadhaar = "Aadhaar",
    TwelfthCertificate = "TwelfthCertificate",
    CharacterCertificate = "CharacterCertificate",
    PanCard = "PanCard",
    ComputerCertificate = "ComputerCertificate",
    Photo = "Photo",
    AttestationForm = "AttestationForm",
    Domicile = "Domicile",
    MedicalCertificate = "MedicalCertificate",
    CasteCertificate = "CasteCertificate",
    IncomeCertificate = "IncomeCertificate",
    Signature = "Signature",
    RegistrationForm = "RegistrationForm",
    IdentityCertificate = "IdentityCertificate"
}
export enum FeeStatus {
    Failed = "Failed",
    Paid = "Paid",
    Pending = "Pending"
}
export enum NotifType {
    important = "important",
    urgent = "urgent",
    general = "general"
}
export enum PaymentMethod {
    upi = "upi",
    netbanking = "netbanking",
    card = "card"
}
export enum PaymentStatus {
    pending = "pending",
    success = "success",
    notRequired = "notRequired",
    failed = "failed"
}
export enum ResultType {
    CGPA = "CGPA",
    Percentage = "Percentage",
    GradePoint = "GradePoint"
}
export enum UpdateCategory {
    officialLetter = "officialLetter",
    recruitment = "recruitment",
    tender = "tender"
}
export enum UserRole {
    applicant = "applicant",
    admin = "admin"
}
export interface backendInterface {
    addDocumentUrl(id: ApplicationId, url: string): Promise<void>;
    adminAddCandidate(applicationId: ApplicationId, candidateName: string, rollNumber: string, state: string, circle: string, division: string, category: string, rank: bigint): Promise<CandidateId>;
    adminAddDocument(candidateId: AdminCandidateId, registrationNo: string, documentType: DocumentType, fileKey: string, fileName: string): Promise<{
        __kind__: "ok";
        ok: Document;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddVacancy(circle: string, division: string, branchOfficeName: string, postType: string, category: string, basicPay: bigint, totalSeats: bigint): Promise<{
        __kind__: "ok";
        ok: Vacancy;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminCreateCircle(stateName: string, circleName: string, divisions: Array<Division>): Promise<CircleId>;
    adminCreateNotification(title: string, content: string, notifType: NotifType): Promise<NotificationId>;
    adminCreateOfficialUpdate(title: string, content: string, category: UpdateCategory, pdfUrl: string | null): Promise<{
        __kind__: "ok";
        ok: OfficialUpdate;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeactivateNotification(id: NotificationId): Promise<void>;
    adminDeleteCandidate(id: CandidateId): Promise<void>;
    adminDeleteCircle(id: CircleId): Promise<void>;
    adminDeleteDocument(id: DocumentId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteNotification(id: NotificationId): Promise<void>;
    adminDeleteOfficialUpdate(id: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteUser(id: UserId): Promise<void>;
    adminDeleteVacancy(id: VacancyId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetActiveVacancies(division: string | null): Promise<Array<Vacancy>>;
    adminGetAllCandidates(circle: string | null, division: string | null, status: AdminCandidateStatus | null): Promise<Array<AdminCandidate>>;
    adminGetAllVacancies(division: string | null): Promise<Array<Vacancy>>;
    adminGetCandidate(id: AdminCandidateId): Promise<AdminCandidate | null>;
    adminGetCandidatesByRegistrationNo(registrationNo: string): Promise<Array<AdminCandidate>>;
    adminGetDashboard(): Promise<{
        pending: bigint;
        approved: bigint;
        rejected: bigint;
        totalCandidates: bigint;
        circleStats: Array<[string, bigint]>;
        divisionStats: Array<[string, bigint]>;
    }>;
    adminGetDocuments(candidateId: AdminCandidateId): Promise<Array<Document>>;
    adminListAllNotifications(): Promise<Array<Notification>>;
    adminListAllOfficialUpdates(): Promise<Array<OfficialUpdate>>;
    adminListApplications(): Promise<Array<Application>>;
    adminListApplicationsByStatus(status: ApplicationStatus): Promise<Array<Application>>;
    adminListPayments(): Promise<Array<Payment>>;
    adminListUsers(): Promise<Array<User>>;
    adminLogin(username: string, password: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminRegisterCandidate(name: string, fatherName: string, mobile: string, email: string, aadhaar: string, dob: string, gender: string, category: string, ph: boolean, canRideBicycle: boolean, isEmployed: boolean, nocAvailable: boolean, presentAddress: AddressInfo, permanentAddress: AddressInfo, boardName: string, stateOfBoard: string, yearOfPassing: string, resultType: ResultType, subjectMarks: Array<SubjectMark>, totalCgpa: string, totalGrade: string, percentageObtained: string, boardRemarks: string, declarationsAccepted: boolean, postPreferences: Array<PostPreference>, divisionForVerification: string, photoPath: string, signaturePath: string, circle: string, division: string, overrideRegistrationNo: string | null): Promise<{
        __kind__: "ok";
        ok: AdminCandidate;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetCandidateApplicationForm(registrationNo: string, formData: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetUserRole(id: UserId, role: UserRole): Promise<void>;
    adminUpdateApplicationStatus(id: ApplicationId, status: ApplicationStatus): Promise<void>;
    adminUpdateCandidateStatus(id: AdminCandidateId, status: AdminCandidateStatus, rejectionReason: string | null): Promise<{
        __kind__: "ok";
        ok: AdminCandidate;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateCircle(id: CircleId, stateName: string, circleName: string, divisions: Array<Division>): Promise<void>;
    adminUpdateFeeStatus(candidateId: AdminCandidateId, feeStatus: FeeStatus): Promise<{
        __kind__: "ok";
        ok: AdminCandidate;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateNotification(id: NotificationId, title: string, content: string, notifType: NotifType): Promise<void>;
    adminUpdateOfficialUpdate(id: string, title: string | null, content: string | null, pdfUrl: string | null, isActive: boolean | null): Promise<{
        __kind__: "ok";
        ok: OfficialUpdate;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdatePaymentStatus(id: PaymentId, status: PaymentStatus): Promise<void>;
    adminUpdateVacancy(id: VacancyId, totalSeats: bigint, isActive: boolean): Promise<{
        __kind__: "ok";
        ok: Vacancy;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminVerifyUser(id: UserId): Promise<void>;
    candidateLogin(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: CandidateLoginResult;
    } | {
        __kind__: "err";
        err: string;
    }>;
    chatWithAI(message: string): Promise<string>;
    confirmPayment(paymentId: PaymentId, transactionId: string): Promise<void>;
    createApplication(educationDetails: EducationDetails, preferences: Preferences): Promise<ApplicationId>;
    getApplicationById(id: ApplicationId): Promise<Application | null>;
    getCandidateByEmail(email: string): Promise<string | null>;
    getCandidateById(id: CandidateId): Promise<ShortlistedCandidate | null>;
    getCandidateProfile(registrationNo: string): Promise<AdminCandidate | null>;
    getCircleById(id: CircleId): Promise<Circle | null>;
    getMyApplications(): Promise<Array<Application>>;
    getMyPayments(): Promise<Array<Payment>>;
    getMyProfile(): Promise<User | null>;
    getNotificationById(id: NotificationId): Promise<Notification | null>;
    getPaymentById(id: PaymentId): Promise<Payment | null>;
    getUserById(id: UserId): Promise<User | null>;
    httpTransform(args: {
        context: Uint8Array;
        response: HttpResponse;
    }): Promise<HttpResponse>;
    initiatePayment(applicationId: ApplicationId, amount: bigint, method: PaymentMethod): Promise<PaymentId>;
    listActiveNotifications(): Promise<Array<Notification>>;
    listActiveOfficialUpdates(): Promise<Array<OfficialUpdate>>;
    listAllCandidates(): Promise<Array<ShortlistedCandidate>>;
    listAllCircles(): Promise<Array<Circle>>;
    listCandidatesByCircle(circle: string): Promise<Array<ShortlistedCandidate>>;
    listCandidatesByState(stateName: string): Promise<Array<ShortlistedCandidate>>;
    listCirclesByState(stateName: string): Promise<Array<Circle>>;
    listOfficialUpdatesByCategory(category: UpdateCategory): Promise<Array<OfficialUpdate>>;
    listStates(): Promise<Array<string>>;
    registerUser(name: string, mobile: string, email: string, aadhaar: string, dob: string, gender: string, category: string, subcategory: string, address: AddressType): Promise<UserId>;
    requestOTP(contact: string): Promise<boolean>;
    submitApplication(id: ApplicationId): Promise<void>;
    updateApplication(id: ApplicationId, educationDetails: EducationDetails, preferences: Preferences): Promise<void>;
    updatePhotoUrl(url: string): Promise<void>;
    updateProfile(name: string, dob: string, gender: string, category: string, subcategory: string, address: AddressType): Promise<void>;
    updateSignatureUrl(url: string): Promise<void>;
    verifyOTP(contact: string, code: string): Promise<boolean>;
}
