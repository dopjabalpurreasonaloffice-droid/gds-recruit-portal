import { type Backend, createActor } from "@/backend";
import {
  type AddressInfo,
  type AdminCandidate as BackendAdminCandidate,
  AdminCandidateStatus as BackendAdminCandidateStatus,
  FeeStatus as BackendFeeStatus,
  type OfficialUpdate as BackendOfficialUpdate,
  ResultType as BackendResultType,
  DocumentType,
  type PostPreference,
  type SubjectMark,
  UpdateCategory,
  type Vacancy,
} from "@/backend";
import {
  attemptAdminLogin,
  isTokenValid,
  removeAdminToken,
} from "@/lib/admin-auth";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────
// Local types for admin-specific entities
// ─────────────────────────────────────────────

export type AdminCandidateStatus = "Pending" | "Approved" | "Rejected";
export type AdminFeeStatus = "Pending" | "Paid" | "Failed";

export type AdminDocumentType =
  | "Registration Form"
  | "Aadhaar Card"
  | "PAN Card"
  | "10th Certificate"
  | "12th Certificate"
  | "Caste Certificate"
  | "Domicile Certificate"
  | "Income Certificate"
  | "Computer Certificate"
  | "Identity Certificate"
  | "Character Certificate"
  | "Medical Certificate"
  | "Attestation Form";

export interface AdminCandidateAddress {
  doorNo: string;
  street: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
}

export interface AdminCandidateSubjectMark {
  subject: string;
  marksOrGrade: string;
}

export interface AdminCandidatePostPreference {
  preferenceNo: number;
  branchOfficeName: string;
  postType: string;
  category: string;
  basicPay: number;
}

// Re-export the backend AdminCandidate type as our primary type
export type AdminCandidate = BackendAdminCandidate;

export interface AdminDocument {
  id: string;
  candidateId: string;
  registrationNo: string;
  documentType: string;
  fileKey: string;
  fileName: string;
  uploadedAt: number;
}

export interface AdminVacancy {
  id: string;
  circle: string;
  division: string;
  branchOfficeName: string;
  postType: "BPM" | "ABPM";
  category: string;
  basicPay: number;
  totalSeats: number;
}

export interface DashboardStats {
  totalCandidates: number;
  approved: number;
  rejected: number;
  pending: number;
  circleStats: [string, number][];
  divisionStats: [string, number][];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function mapResultType(rt: string): BackendResultType {
  if (rt === "CGPA") return BackendResultType.CGPA;
  if (rt === "Grade/Point") return BackendResultType.GradePoint;
  return BackendResultType.Percentage;
}

function mapDocumentType(dt: string): DocumentType {
  const map: Record<string, DocumentType> = {
    "Registration Form": DocumentType.RegistrationForm,
    "Aadhaar Card": DocumentType.Aadhaar,
    "PAN Card": DocumentType.PanCard,
    "10th Certificate": DocumentType.TenthCertificate,
    "12th Certificate": DocumentType.TwelfthCertificate,
    "Caste Certificate": DocumentType.CasteCertificate,
    "Domicile Certificate": DocumentType.Domicile,
    "Income Certificate": DocumentType.IncomeCertificate,
    "Computer Certificate": DocumentType.ComputerCertificate,
    "Identity Certificate": DocumentType.IdentityCertificate,
    "Character Certificate": DocumentType.CharacterCertificate,
    "Medical Certificate": DocumentType.MedicalCertificate,
    "Attestation Form": DocumentType.AttestationForm,
  };
  return map[dt] ?? DocumentType.RegistrationForm;
}

function mapBackendVacancy(v: Vacancy): AdminVacancy {
  return {
    id: String(v.id),
    circle: v.circle,
    division: v.division,
    branchOfficeName: v.branchOfficeName,
    postType: v.postType as "BPM" | "ABPM",
    category: v.category,
    basicPay: Number(v.basicPay),
    totalSeats: Number(v.totalSeats),
  };
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      const token = attemptAdminLogin(username, password);
      if (!token) throw new Error("Invalid username or password");
      return { username };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      removeAdminToken();
    },
    onSuccess: () => {
      qc.clear();
    },
  });
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export function useAdminDashboard() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<DashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor)
        return {
          totalCandidates: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          circleStats: [],
          divisionStats: [],
        };
      try {
        const result = await actor.adminGetDashboard();
        return {
          totalCandidates: Number(result.totalCandidates),
          approved: Number(result.approved),
          rejected: Number(result.rejected),
          pending: Number(result.pending),
          circleStats: result.circleStats.map(
            ([k, v]) => [k, Number(v)] as [string, number],
          ),
          divisionStats: result.divisionStats.map(
            ([k, v]) => [k, Number(v)] as [string, number],
          ),
        };
      } catch {
        return {
          totalCandidates: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          circleStats: [],
          divisionStats: [],
        };
      }
    },
    enabled: isTokenValid() && !!actor && !isFetching,
  });
}

// ─────────────────────────────────────────────
// Candidates
// ─────────────────────────────────────────────

export function useAdminCandidates(filters?: {
  circle?: string;
  division?: string;
  status?: AdminCandidateStatus;
}) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<AdminCandidate[]>({
    queryKey: ["admin", "candidates", filters],
    queryFn: async () => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) return [];
      const statusMap: Record<
        AdminCandidateStatus,
        BackendAdminCandidateStatus
      > = {
        Pending: BackendAdminCandidateStatus.Pending,
        Approved: BackendAdminCandidateStatus.Approved,
        Rejected: BackendAdminCandidateStatus.Rejected,
      };
      return actor.adminGetAllCandidates(
        filters?.circle ?? null,
        filters?.division ?? null,
        filters?.status ? statusMap[filters.status] : null,
      );
    },
    enabled: isTokenValid() && !!actor && !isFetching,
  });
}

export function useAdminAddCandidate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      fatherName: string;
      dob: string;
      category: string;
      mobile: string;
      email?: string;
      aadhaar?: string;
      gender?: string;
      ph?: boolean;
      canRideBicycle?: boolean;
      isEmployed?: boolean;
      nocAvailable?: boolean;
      circle: string;
      division: string;
      overrideRegistrationNo?: string;
      presentAddress?: AdminCandidateAddress;
      permanentAddress?: AdminCandidateAddress;
      boardName?: string;
      stateOfBoard?: string;
      yearOfPassing?: string;
      resultType?: string;
      subjectMarks?: AdminCandidateSubjectMark[];
      totalCgpa?: string;
      totalGrade?: string;
      percentageObtained?: string;
      boardRemarks?: string;
      declarationsAccepted?: boolean;
      postPreferences?: AdminCandidatePostPreference[];
      divisionForVerification?: string;
      photoPath?: string;
      signaturePath?: string;
    }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");

      const emptyAddress: AddressInfo = {
        doorNo: "",
        street: "",
        village: "",
        district: "",
        state: "",
        pincode: "",
      };
      const toAddr = (a?: AdminCandidateAddress): AddressInfo =>
        a
          ? {
              doorNo: a.doorNo,
              street: a.street,
              village: a.village,
              district: a.district,
              state: a.state,
              pincode: a.pincode,
            }
          : emptyAddress;

      const subjectMarks: SubjectMark[] = (params.subjectMarks ?? []).map(
        (sm) => ({
          subject: sm.subject,
          marksOrGrade: sm.marksOrGrade,
        }),
      );

      const postPreferences: PostPreference[] = (
        params.postPreferences ?? []
      ).map((pp, i) => ({
        preferenceNo: BigInt(pp.preferenceNo ?? i + 1),
        branchOfficeName: pp.branchOfficeName,
        postType: pp.postType,
        category: pp.category,
        basicPay: BigInt(pp.basicPay),
      }));

      const result = await actor.adminRegisterCandidate(
        params.name,
        params.fatherName,
        params.mobile,
        params.email ?? "",
        params.aadhaar ?? "",
        params.dob,
        params.gender ?? "",
        params.category,
        params.ph ?? false,
        params.canRideBicycle ?? false,
        params.isEmployed ?? false,
        params.nocAvailable ?? false,
        toAddr(params.presentAddress),
        toAddr(params.permanentAddress),
        params.boardName ?? "",
        params.stateOfBoard ?? "",
        params.yearOfPassing ?? "",
        mapResultType(params.resultType ?? "Percentage"),
        subjectMarks,
        params.totalCgpa ?? "",
        params.totalGrade ?? "",
        params.percentageObtained ?? "",
        params.boardRemarks ?? "",
        params.declarationsAccepted ?? false,
        postPreferences,
        params.divisionForVerification ?? params.division,
        params.photoPath ?? "",
        params.signaturePath ?? "",
        params.circle,
        params.division,
        params.overrideRegistrationNo?.trim() || null,
      );

      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return result.ok;
        throw new Error(result.err);
      }
      return result as AdminCandidate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useAdminUpdateCandidateStatus() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: AdminCandidateStatus;
      rejectionReason?: string;
    }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const statusMap: Record<
        AdminCandidateStatus,
        BackendAdminCandidateStatus
      > = {
        Pending: BackendAdminCandidateStatus.Pending,
        Approved: BackendAdminCandidateStatus.Approved,
        Rejected: BackendAdminCandidateStatus.Rejected,
      };
      const result = await actor.adminUpdateCandidateStatus(
        BigInt(id),
        statusMap[status],
        rejectionReason ?? null,
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return result.ok;
        throw new Error(result.err);
      }
      return result as AdminCandidate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useAdminUpdateFeeStatus() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      candidateId,
      feeStatus,
    }: { candidateId: string; feeStatus: AdminFeeStatus }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const feeMap: Record<AdminFeeStatus, BackendFeeStatus> = {
        Pending: BackendFeeStatus.Pending,
        Paid: BackendFeeStatus.Paid,
        Failed: BackendFeeStatus.Failed,
      };
      const result = await actor.adminUpdateFeeStatus(
        BigInt(candidateId),
        feeMap[feeStatus],
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return result.ok;
        throw new Error(result.err);
      }
      return result as AdminCandidate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
    },
  });
}

export function useAdminCandidatesByRegNo(registrationNo: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<AdminCandidate[]>({
    queryKey: ["admin", "candidates", "regNo", registrationNo],
    queryFn: async () => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) return [];
      return actor.adminGetCandidatesByRegistrationNo(registrationNo);
    },
    enabled: isTokenValid() && !!actor && !isFetching && !!registrationNo,
  });
}

// ─────────────────────────────────────────────
// Documents
// ─────────────────────────────────────────────

export function useAdminDocuments(candidateId: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<AdminDocument[]>({
    queryKey: ["admin", "documents", candidateId],
    queryFn: async () => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) return [];
      const docs = await actor.adminGetDocuments(BigInt(candidateId));
      return docs.map((d) => ({
        id: String(d.id),
        candidateId: String(d.candidateId),
        registrationNo: d.registrationNo,
        documentType: d.documentType,
        fileKey: d.fileKey,
        fileName: d.fileName,
        uploadedAt: Number(d.uploadedAt),
      }));
    },
    enabled: isTokenValid() && !!actor && !isFetching && !!candidateId,
  });
}

export function useAdminAddDocument() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      candidateId: string;
      registrationNo: string;
      documentType: string;
      fileKey: string;
      fileName: string;
    }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminAddDocument(
        BigInt(params.candidateId),
        params.registrationNo,
        mapDocumentType(params.documentType),
        params.fileKey,
        params.fileName,
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") {
          const d = result.ok;
          return {
            id: String(d.id),
            candidateId: String(d.candidateId),
            registrationNo: d.registrationNo,
            documentType: d.documentType,
            fileKey: d.fileKey,
            fileName: d.fileName,
            uploadedAt: Number(d.uploadedAt),
          } as AdminDocument;
        }
        throw new Error(result.err);
      }
      return params as unknown as AdminDocument;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["admin", "documents", variables.candidateId],
      });
    },
  });
}

// ─────────────────────────────────────────────
// Vacancy public accessor (no auth required — for BO filter in forms)
// ─────────────────────────────────────────────

let _cachedVacancies: AdminVacancy[] = [];

export function getAvailableVacancies(): AdminVacancy[] {
  return _cachedVacancies;
}

// ─────────────────────────────────────────────
// Vacancies
// ─────────────────────────────────────────────

export function useAdminGetVacancies() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<{ vacancy: AdminVacancy; filledSeats: number }[]>({
    queryKey: ["admin", "vacancies"],
    queryFn: async () => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) return [];
      const vacancies = await actor.adminGetAllVacancies(null);
      const mapped = vacancies.map(mapBackendVacancy);
      _cachedVacancies = mapped;
      return mapped.map((v) => ({ vacancy: v, filledSeats: 0 }));
    },
    enabled: isTokenValid() && !!actor && !isFetching,
  });
}

/** Non-admin hook — loads active vacancies for form dropdowns */
export function useActiveVacancies(division?: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<AdminVacancy[]>({
    queryKey: ["vacancies", "active", division],
    queryFn: async () => {
      if (!actor) return [];
      const vacancies = await actor.adminGetActiveVacancies(division ?? null);
      const mapped = vacancies.map(mapBackendVacancy);
      _cachedVacancies = mapped;
      return mapped;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAddVacancy() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      circle: string;
      division: string;
      branchOfficeName: string;
      postType: "BPM" | "ABPM";
      category: string;
      basicPay: number;
      totalSeats: number;
    }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminAddVacancy(
        params.circle,
        params.division,
        params.branchOfficeName,
        params.postType,
        params.category,
        BigInt(params.basicPay),
        BigInt(params.totalSeats),
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return mapBackendVacancy(result.ok);
        throw new Error(result.err);
      }
      return mapBackendVacancy(result as Vacancy);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "vacancies"] });
      qc.invalidateQueries({ queryKey: ["vacancies"] });
    },
  });
}

export function useAdminUpdateVacancy() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      totalSeats,
      isActive,
    }: { id: string; totalSeats: number; isActive?: boolean }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminUpdateVacancy(
        BigInt(id),
        BigInt(totalSeats),
        isActive ?? true,
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return mapBackendVacancy(result.ok);
        throw new Error(result.err);
      }
      return mapBackendVacancy(result as Vacancy);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "vacancies"] });
    },
  });
}

export function useAdminDeleteVacancy() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminDeleteVacancy(BigInt(id));
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return id;
        throw new Error(result.err);
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "vacancies"] });
    },
  });
}

// ─────────────────────────────────────────────
// Application Form PDF
// ─────────────────────────────────────────────

export function useAdminSetApplicationForm() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      registrationNo,
      formData,
    }: { registrationNo: string; formData: string }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminSetCandidateApplicationForm(
        registrationNo,
        formData,
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return;
        throw new Error(result.err);
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
      if (variables?.registrationNo) {
        qc.invalidateQueries({
          queryKey: ["candidate", "profile", variables.registrationNo],
        });
      }
    },
  });
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────

export type OfficialUpdateCategory =
  | "Official Letters"
  | "Tenders"
  | "Recruitment";

export interface OfficialUpdate {
  id: string;
  title: string;
  content: string;
  category: OfficialUpdateCategory;
  date: string; // formatted display date "DD.MM.YYYY"
  pdfUrl: string;
  isNew: boolean;
  isActive: boolean;
  createdAt: number;
}

function mapUpdateCategory(cat: OfficialUpdateCategory): UpdateCategory {
  if (cat === "Official Letters") return UpdateCategory.officialLetter;
  if (cat === "Tenders") return UpdateCategory.tender;
  return UpdateCategory.recruitment;
}

function mapBackendUpdateCategory(cat: UpdateCategory): OfficialUpdateCategory {
  if (cat === UpdateCategory.officialLetter) return "Official Letters";
  if (cat === UpdateCategory.tender) return "Tenders";
  return "Recruitment";
}

function formatTimestampToDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms > 1e12 ? ms : Number(ts) * 1000);
  if (Number.isNaN(d.getTime())) return String(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getFullYear()}`;
}

function mapBackendOfficialUpdate(u: BackendOfficialUpdate): OfficialUpdate {
  return {
    id: u.id,
    title: u.title,
    content: u.content,
    category: mapBackendUpdateCategory(u.category),
    date: formatTimestampToDate(u.date),
    pdfUrl: u.pdfUrl ?? "",
    isNew: u.isNew,
    isActive: u.isActive,
    createdAt: Number(u.date),
  };
}

export function useAdminListAllOfficialUpdates() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<OfficialUpdate[]>({
    queryKey: ["admin", "official-updates"],
    queryFn: async () => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) return [];
      const updates = await actor.adminListAllOfficialUpdates();
      return updates
        .map(mapBackendOfficialUpdate)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: isTokenValid() && !!actor && !isFetching,
  });
}

export function useListActiveOfficialUpdates() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<OfficialUpdate[]>({
    queryKey: ["official-updates", "active"],
    queryFn: async () => {
      if (!actor) return [];
      const updates = await actor.listActiveOfficialUpdates();
      return updates
        .map(mapBackendOfficialUpdate)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListOfficialUpdatesByCategory(cat: OfficialUpdateCategory) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<OfficialUpdate[]>({
    queryKey: ["official-updates", "category", cat],
    queryFn: async () => {
      if (!actor) return [];
      const updates = await actor.listOfficialUpdatesByCategory(
        mapUpdateCategory(cat),
      );
      return updates
        .map(mapBackendOfficialUpdate)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminCreateOfficialUpdate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      content: string;
      category: OfficialUpdateCategory;
      pdfUrl: string;
    }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminCreateOfficialUpdate(
        params.title,
        params.content || params.title,
        mapUpdateCategory(params.category),
        params.pdfUrl || null,
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok")
          return mapBackendOfficialUpdate(result.ok);
        throw new Error(result.err);
      }
      return mapBackendOfficialUpdate(result as BackendOfficialUpdate);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "official-updates"] });
      qc.invalidateQueries({ queryKey: ["official-updates"] });
    },
  });
}

export function useAdminUpdateOfficialUpdate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      title?: string;
      content?: string;
      pdfUrl?: string;
      isActive?: boolean;
    }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminUpdateOfficialUpdate(
        params.id,
        params.title ?? null,
        params.content ?? null,
        params.pdfUrl !== undefined ? params.pdfUrl : null,
        params.isActive !== undefined ? params.isActive : null,
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok")
          return mapBackendOfficialUpdate(result.ok);
        throw new Error(result.err);
      }
      return mapBackendOfficialUpdate(result as BackendOfficialUpdate);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "official-updates"] });
      qc.invalidateQueries({ queryKey: ["official-updates"] });
    },
  });
}

export function useAdminDeleteOfficialUpdate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminDeleteOfficialUpdate(id);
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return id;
        throw new Error(result.err);
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "official-updates"] });
      qc.invalidateQueries({ queryKey: ["official-updates"] });
    },
  });
}

// ─────────────────────────────────────────────
// Candidate self-login (calls real backend via actor)
// ─────────────────────────────────────────────

export interface CandidateLoginResult {
  token: string;
  registrationNo: string;
  name: string;
  mobile: string;
  status: string;
}

/**
 * Attempt candidate self-login using email + password via the backend actor.
 * Creates a temporary actor for the call since this is outside React context.
 */
export async function candidateLoginAsync(
  email: string,
  password: string,
): Promise<CandidateLoginResult | null> {
  if (!email || !password) return null;
  try {
    // Resolve canister ID: Vite env var (preferred) → meta tag → empty string fallback
    const envId = (import.meta as unknown as { env: Record<string, string> })
      .env?.CANISTER_ID_BACKEND;
    const metaId = (
      document.querySelector(
        "meta[name='canister-id']",
      ) as HTMLMetaElement | null
    )?.content;
    const canisterId = envId || metaId || "";

    if (!canisterId) {
      throw new Error("Canister ID not found. Backend connection unavailable.");
    }

    const tmpActor = createActor(
      canisterId,
      async () => new Uint8Array(),
      async () => {
        throw new Error("download not supported");
      },
    );

    const result = await tmpActor.candidateLogin(email, password);
    if ("__kind__" in result) {
      if (result.__kind__ === "ok") {
        return {
          token: result.ok.token,
          registrationNo: result.ok.registrationNo,
          name: result.ok.name,
          mobile: result.ok.mobile,
          status: String(result.ok.status),
        };
      }
      // Backend returned an error variant — surface it as null (handled by caller)
      return null;
    }
    return null;
  } catch (err) {
    console.error("[candidateLoginAsync] error:", err);
    return null;
  }
}

/** Legacy synchronous stub — always returns null; use candidateLoginAsync */
export function candidateLogin(
  _email: string,
  _password: string,
): CandidateLoginResult | null {
  return null;
}

/** React hook for candidate self-login — uses useActor so actor is always ready */
export function useCandidateLogin() {
  const { actor } = useActor<Backend>(createActor);
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<CandidateLoginResult> => {
      if (!actor) throw new Error("Backend not ready. Please try again.");
      const result = await actor.candidateLogin(email, password);
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") {
          return {
            token: result.ok.token,
            registrationNo: result.ok.registrationNo,
            name: result.ok.name,
            mobile: result.ok.mobile,
            status: String(result.ok.status),
          };
        }
        throw new Error(
          result.err ||
            "Email ya password galat hai. Sirf admin-registered candidates login kar sakte hain.",
        );
      }
      throw new Error(
        "Email ya password galat hai. Sirf admin-registered candidates login kar sakte hain.",
      );
    },
  });
}

/** React hook for loading candidate profile */
export function useCandidateProfile(registrationNo: string | null) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<AdminCandidate | null>({
    queryKey: ["candidate", "profile", registrationNo],
    queryFn: async () => {
      if (!registrationNo || !actor) return null;
      return actor.getCandidateProfile(registrationNo);
    },
    enabled: !!registrationNo && !!actor && !isFetching,
    retry: 1,
  });
}

/** Async candidate profile fetch (outside React context) */
export async function getCandidateProfileAsync(
  registrationNo: string,
): Promise<AdminCandidate | null> {
  try {
    const canisterId =
      (
        document.querySelector(
          "meta[name='canister-id']",
        ) as HTMLMetaElement | null
      )?.content ?? "";
    const tmpActor = createActor(
      canisterId,
      async () => new Uint8Array(),
      async () => {
        throw new Error("download not supported");
      },
    );
    return tmpActor.getCandidateProfile(registrationNo);
  } catch {
    return null;
  }
}

export function useAdminSetCandidateApplicationForm() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      registrationNo,
      formData,
    }: { registrationNo: string; formData: string }) => {
      if (!isTokenValid()) throw new Error("Unauthorized");
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminSetCandidateApplicationForm(
        registrationNo,
        formData,
      );
      if ("__kind__" in result) {
        if (result.__kind__ === "ok") return;
        throw new Error(result.err);
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["candidate", "profile", variables.registrationNo],
      });
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
    },
  });
}

/** Legacy sync stub — always returns null; use useCandidateProfile hook */
export function getCandidateProfile(
  _registrationNo: string,
): AdminCandidate | null {
  return null;
}

// ─────────────────────────────────────────────
// Re-exports
// ─────────────────────────────────────────────

export { useActor };
export type { Backend };
