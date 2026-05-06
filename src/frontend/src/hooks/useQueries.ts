import { type Backend, createActor } from "@/backend";
import type {
  AddressType,
  Application,
  ApplicationId,
  ApplicationStatus,
  Circle,
  CircleId,
  Division,
  EducationDetails,
  NotifType,
  Notification,
  OfficialUpdate,
  Payment,
  PaymentId,
  PaymentMethod,
  Preferences,
  ShortlistedCandidate,
  UpdateCategory,
  User,
  UserId,
  UserRole,
} from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export function useActiveNotifications() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Notification[]>({
    queryKey: ["notifications", "active"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllNotificationsAdmin() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Notification[]>({
    queryKey: ["notifications", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListAllNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateNotification() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      notifType,
    }: {
      title: string;
      content: string;
      notifType: NotifType;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminCreateNotification(title, content, notifType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useUpdateNotification() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      notifType,
    }: {
      id: bigint;
      title: string;
      content: string;
      notifType: NotifType;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminUpdateNotification(id, title, content, notifType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteNotification(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeactivateNotification() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeactivateNotification(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─────────────────────────────────────────────
// Circles / States
// ─────────────────────────────────────────────

export function useAllCircles() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Circle[]>({
    queryKey: ["circles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllCircles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCirclesByState(stateName: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Circle[]>({
    queryKey: ["circles", "state", stateName],
    queryFn: async () => {
      if (!actor || !stateName) return [];
      return actor.listCirclesByState(stateName);
    },
    enabled: !!actor && !isFetching && !!stateName,
  });
}

export function useListStates() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<string[]>({
    queryKey: ["states"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCircle() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stateName,
      circleName,
      divisions,
    }: {
      stateName: string;
      circleName: string;
      divisions: Division[];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminCreateCircle(stateName, circleName, divisions);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["circles"] }),
  });
}

export function useUpdateCircle() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      stateName,
      circleName,
      divisions,
    }: {
      id: CircleId;
      stateName: string;
      circleName: string;
      divisions: Division[];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminUpdateCircle(id, stateName, circleName, divisions);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["circles"] }),
  });
}

export function useDeleteCircle() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: CircleId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteCircle(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["circles"] }),
  });
}

// ─────────────────────────────────────────────
// User / Registration
// ─────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<User | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      mobile: string;
      email: string;
      aadhaar: string;
      dob: string;
      gender: string;
      category: string;
      subcategory: string;
      address: AddressType;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const {
        name,
        mobile,
        email,
        aadhaar,
        dob,
        gender,
        category,
        subcategory,
        address,
      } = params;
      return actor.registerUser(
        name,
        mobile,
        email,
        aadhaar,
        dob,
        gender,
        category,
        subcategory,
        address,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useUpdateProfile() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      dob: string;
      gender: string;
      category: string;
      subcategory: string;
      address: AddressType;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const { name, dob, gender, category, subcategory, address } = params;
      return actor.updateProfile(
        name,
        dob,
        gender,
        category,
        subcategory,
        address,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useRequestOTP() {
  const { actor } = useActor<Backend>(createActor);
  return useMutation({
    mutationFn: async (contact: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.requestOTP(contact);
    },
  });
}

export function useVerifyOTP() {
  const { actor } = useActor<Backend>(createActor);
  return useMutation({
    mutationFn: async ({
      contact,
      code,
    }: { contact: string; code: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.verifyOTP(contact, code);
    },
  });
}

// ─────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────

export function useMyApplications() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Application[]>({
    queryKey: ["applications", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplicationById(id: ApplicationId | null) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Application | null>({
    queryKey: ["applications", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getApplicationById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAllApplicationsAdmin() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Application[]>({
    queryKey: ["applications", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplicationsByStatus(status: ApplicationStatus) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Application[]>({
    queryKey: ["applications", "status", status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListApplicationsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateApplication() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      educationDetails,
      preferences,
    }: {
      educationDetails: EducationDetails;
      preferences: Preferences;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createApplication(educationDetails, preferences);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useSubmitApplication() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: ApplicationId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitApplication(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: ApplicationId;
      status: ApplicationStatus;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminUpdateApplicationStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

// ─────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────

export function useMyPayments() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Payment[]>({
    queryKey: ["payments", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPaymentsAdmin() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Payment[]>({
    queryKey: ["payments", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInitiatePayment() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      amount,
      method,
    }: {
      applicationId: ApplicationId;
      amount: bigint;
      method: PaymentMethod;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.initiatePayment(applicationId, amount, method);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useConfirmPayment() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      paymentId,
      transactionId,
    }: {
      paymentId: PaymentId;
      transactionId: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.confirmPayment(paymentId, transactionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

// ─────────────────────────────────────────────
// Shortlisted Candidates
// ─────────────────────────────────────────────

export function useAllCandidates() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<ShortlistedCandidate[]>({
    queryKey: ["candidates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllCandidates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCandidatesByState(stateName: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<ShortlistedCandidate[]>({
    queryKey: ["candidates", "state", stateName],
    queryFn: async () => {
      if (!actor || !stateName) return [];
      return actor.listCandidatesByState(stateName);
    },
    enabled: !!actor && !isFetching && !!stateName,
  });
}

export function useCandidatesByCircle(circle: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<ShortlistedCandidate[]>({
    queryKey: ["candidates", "circle", circle],
    queryFn: async () => {
      if (!actor || !circle) return [];
      return actor.listCandidatesByCircle(circle);
    },
    enabled: !!actor && !isFetching && !!circle,
  });
}

export function useAddCandidate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      applicationId: ApplicationId;
      candidateName: string;
      rollNumber: string;
      state: string;
      circle: string;
      division: string;
      category: string;
      rank: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const {
        applicationId,
        candidateName,
        rollNumber,
        state,
        circle,
        division,
        category,
        rank,
      } = params;
      return actor.adminAddCandidate(
        applicationId,
        candidateName,
        rollNumber,
        state,
        circle,
        division,
        category,
        rank,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

export function useDeleteCandidate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteCandidate(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

// ─────────────────────────────────────────────
// Admin — Users
// ─────────────────────────────────────────────

export function useAllUsersAdmin() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<User[]>({
    queryKey: ["users", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUserRole() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: UserId; role: UserRole }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminSetUserRole(id, role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useVerifyUser() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: UserId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminVerifyUser(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: UserId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteUser(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// ─────────────────────────────────────────────
// Photo / Signature
// ─────────────────────────────────────────────

export function useUpdatePhotoUrl() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updatePhotoUrl(url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useUpdateSignatureUrl() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateSignatureUrl(url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useAddDocumentUrl() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, url }: { id: ApplicationId; url: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addDocumentUrl(id, url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

// ─────────────────────────────────────────────
// Official Updates
// ─────────────────────────────────────────────

export function useActiveOfficialUpdates() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<OfficialUpdate[]>({
    queryKey: ["officialUpdates", "active"],
    queryFn: async () => {
      if (!actor) return [];
      const results = await actor.listActiveOfficialUpdates();
      return [...results].sort((a, b) => Number(b.date) - Number(a.date));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOfficialUpdatesByCategory(category: UpdateCategory) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<OfficialUpdate[]>({
    queryKey: ["officialUpdates", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      const results = await actor.listOfficialUpdatesByCategory(category);
      return [...results].sort((a, b) => Number(b.date) - Number(a.date));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOfficialUpdatesAdmin() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<OfficialUpdate[]>({
    queryKey: ["officialUpdates", "all"],
    queryFn: async () => {
      if (!actor) return [];
      const results = await actor.adminListAllOfficialUpdates();
      return [...results].sort((a, b) => Number(b.date) - Number(a.date));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOfficialUpdate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      category,
      pdfUrl,
    }: {
      title: string;
      content: string;
      category: UpdateCategory;
      pdfUrl: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminCreateOfficialUpdate(title, content, category, pdfUrl);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["officialUpdates"] }),
  });
}

export function useUpdateOfficialUpdate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      pdfUrl,
      isActive,
    }: {
      id: string;
      title: string | null;
      content: string | null;
      pdfUrl: string | null;
      isActive: boolean | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminUpdateOfficialUpdate(
        id,
        title,
        content,
        pdfUrl,
        isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["officialUpdates"] }),
  });
}

export function useDeleteOfficialUpdate() {
  const { actor } = useActor<Backend>(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteOfficialUpdate(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["officialUpdates"] }),
  });
}
