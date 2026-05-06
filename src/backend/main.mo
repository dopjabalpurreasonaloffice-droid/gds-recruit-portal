
import Types "types/common";
import AdminLib "lib/admin";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";


import UsersApi "mixins/users-api";
import OtpApi "mixins/otp-api";
import ApplicationsApi "mixins/applications-api";
import PaymentsApi "mixins/payments-api";
import NotificationsApi "mixins/notifications-api";
import CirclesApi "mixins/circles-api";
import CandidatesApi "mixins/candidates-api";
import AdminApi "mixins/admin-api";
import CandidateAuthApi "mixins/candidate-auth-api";
import OfficialUpdatesApi "mixins/official-updates-api";



actor {
  // ─── Counters ─────────────────────────────────────────────────────────────────
  var nextUserId : Nat = 1;
  var nextApplicationId : Nat = 1;
  var nextPaymentId : Nat = 1;
  var nextNotificationId : Nat = 1;
  var nextCircleId : Nat = 1;
  var nextCandidateId : Nat = 1;
  var nextOtpId : Nat = 1;
  var nextOfficialUpdateId : Nat = 1;
  var seedDone : Bool = false;

  // ─── State Maps ──────────────────────────────────────────────────────────────
  let users : Map.Map<Types.UserId, Types.User> = Map.empty();
  let principalIndex : Map.Map<Principal, Types.UserId> = Map.empty();
  let otps : Map.Map<Text, Types.OTPRecord> = Map.empty();
  let applications : Map.Map<Types.ApplicationId, Types.Application> = Map.empty();
  let payments : Map.Map<Types.PaymentId, Types.Payment> = Map.empty();
  let notifications : Map.Map<Types.NotificationId, Types.Notification> = Map.empty();
  let circles : Map.Map<Types.CircleId, Types.Circle> = Map.empty();
  let candidates : Map.Map<Types.CandidateId, Types.ShortlistedCandidate> = Map.empty();

  // ─── Admin State Maps ─────────────────────────────────────────────────────────
  let adminCandidatesV2 : Map.Map<AdminLib.AdminCandidateId, AdminLib.AdminCandidate> = Map.empty();
  let adminDocumentsV3 : Map.Map<AdminLib.DocumentId, AdminLib.Document> = Map.empty();
  let adminVacanciesV2 : Map.Map<AdminLib.VacancyId, AdminLib.Vacancy> = Map.empty();
  let officialUpdates : Map.Map<Text, Types.OfficialUpdate> = Map.empty();

  // ─── Seed Data ───────────────────────────────────────────────────────────────
  func seedNotifications() {
    let notifData : [(Text, Text, Types.NotifType)] = [
      ("Recruitment Open: GDS Special Drive Schedule-3", "Applications are now open for GDS Online Engagement Special Drive Schedule-3 (15.01.2026). Apply before the deadline.", #urgent),
      ("Important: Document Verification", "Shortlisted candidates must report for document verification as per schedule.", #important),
      ("Fee Payment Window Extended", "Fee payment window has been extended. Check portal for details.", #general),
      ("New Posts Added: Madhya Pradesh Circle", "Additional posts added for Madhya Pradesh Circle. Check Circle-wise posts section.", #important),
      ("Admit Card Download", "Admit cards for shortlisted candidates are available for download.", #urgent),
    ];
    for ((title, content, notifType) in notifData.vals()) {
      let id = nextNotificationId;
      nextNotificationId += 1;
      notifications.add(id, {
        id = id;
        title = title;
        content = content;
        notifType = notifType;
        date = Time.now();
        isActive = true;
        createdBy = 0;
      });
    };
  };

  func seedCircles() {
    let emptyPost : Types.Post = { category = "GDS"; totalPosts = 0; urPosts = 0; obcPosts = 0; scPosts = 0; stPosts = 0 };
    let circleData : [(Text, Text, [Types.Division])] = [
      ("Maharashtra", "Maharashtra Circle", [
        { id = 1; name = "Mumbai Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 120; urPosts = 60; obcPosts = 30; scPosts = 20; stPosts = 10 }] },
        { id = 2; name = "Pune Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 90; urPosts = 45; obcPosts = 22; scPosts = 15; stPosts = 8 }] },
      ]),
      ("Uttar Pradesh", "UP Circle", [
        { id = 3; name = "Lucknow Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 200; urPosts = 100; obcPosts = 54; scPosts = 30; stPosts = 16 }] },
        { id = 4; name = "Varanasi Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 150; urPosts = 75; obcPosts = 40; scPosts = 25; stPosts = 10 }] },
      ]),
      ("Karnataka", "Karnataka Circle", [
        { id = 5; name = "Bengaluru Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 110; urPosts = 55; obcPosts = 30; scPosts = 15; stPosts = 10 }] },
        { id = 6; name = "Mysuru Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 80; urPosts = 40; obcPosts = 20; scPosts = 12; stPosts = 8 }] },
      ]),
      ("Tamil Nadu", "Tamil Nadu Circle", [
        { id = 7; name = "Chennai Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 130; urPosts = 65; obcPosts = 35; scPosts = 20; stPosts = 10 }] },
        { id = 8; name = "Coimbatore Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 100; urPosts = 50; obcPosts = 27; scPosts = 15; stPosts = 8 }] },
      ]),
      ("Delhi", "Delhi Circle", [
        { id = 9; name = "North Delhi Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 60; urPosts = 30; obcPosts = 16; scPosts = 9; stPosts = 5 }] },
        { id = 10; name = "South Delhi Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 55; urPosts = 28; obcPosts = 15; scPosts = 8; stPosts = 4 }] },
      ]),
      ("Madhya Pradesh", "MP Circle", [
        { id = 11; name = "Bhopal Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 180; urPosts = 90; obcPosts = 50; scPosts = 25; stPosts = 15 }] },
        { id = 12; name = "Indore Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 160; urPosts = 80; obcPosts = 45; scPosts = 22; stPosts = 13 }] },
        { id = 13; name = "Jabalpur Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 140; urPosts = 70; obcPosts = 38; scPosts = 20; stPosts = 12 }] },
        { id = 14; name = "Gwalior Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 120; urPosts = 60; obcPosts = 33; scPosts = 17; stPosts = 10 }] },
        { id = 15; name = "Sagar Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 100; urPosts = 50; obcPosts = 27; scPosts = 15; stPosts = 8 }] },
        { id = 16; name = "Rewa Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 90; urPosts = 45; obcPosts = 24; scPosts = 13; stPosts = 8 }] },
        { id = 17; name = "Ujjain Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 110; urPosts = 55; obcPosts = 30; scPosts = 16; stPosts = 9 }] },
        { id = 18; name = "Satna Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 80; urPosts = 40; obcPosts = 22; scPosts = 12; stPosts = 6 }] },
        { id = 19; name = "Chhindwara Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 95; urPosts = 47; obcPosts = 26; scPosts = 14; stPosts = 8 }] },
        { id = 20; name = "Hoshangabad Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 75; urPosts = 37; obcPosts = 20; scPosts = 11; stPosts = 7 }] },
        { id = 21; name = "Morena Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 85; urPosts = 42; obcPosts = 23; scPosts = 13; stPosts = 7 }] },
        { id = 22; name = "Betul Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 70; urPosts = 35; obcPosts = 19; scPosts = 10; stPosts = 6 }] },
        { id = 23; name = "Seoni Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 65; urPosts = 32; obcPosts = 18; scPosts = 10; stPosts = 5 }] },
        { id = 24; name = "Mandla Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 60; urPosts = 30; obcPosts = 16; scPosts = 9; stPosts = 5 }] },
        { id = 25; name = "Balaghat Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 72; urPosts = 36; obcPosts = 19; scPosts = 11; stPosts = 6 }] },
        { id = 26; name = "Vidisha Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 68; urPosts = 34; obcPosts = 18; scPosts = 10; stPosts = 6 }] },
        { id = 27; name = "Shivpuri Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 78; urPosts = 39; obcPosts = 21; scPosts = 12; stPosts = 6 }] },
        { id = 28; name = "Khandwa Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 82; urPosts = 41; obcPosts = 22; scPosts = 13; stPosts = 6 }] },
        { id = 29; name = "Ratlam Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 88; urPosts = 44; obcPosts = 24; scPosts = 13; stPosts = 7 }] },
        { id = 30; name = "Shahdol Division"; posts = [{ emptyPost with category = "BPM"; totalPosts = 74; urPosts = 37; obcPosts = 20; scPosts = 11; stPosts = 6 }] },
      ]),
    ];
    for ((stateName, circleName, divisions) in circleData.vals()) {
      let id = nextCircleId;
      nextCircleId += 1;
      circles.add(id, { id = id; stateName = stateName; circleName = circleName; divisions = divisions });
    };
  };

  func seedCandidates() {
    let candidateData : [(Text, Text, Text, Text, Text, Text, Nat)] = [
      ("Priya Sharma", "MH001", "Maharashtra", "Mumbai Division", "GDS BPM", "UR", 1),
      ("Rahul Patil", "MH002", "Maharashtra", "Pune Division", "GDS BPM", "OBC", 1),
      ("Amit Singh", "UP001", "Uttar Pradesh", "Lucknow Division", "GDS BPM", "UR", 1),
      ("Sunita Verma", "UP002", "Uttar Pradesh", "Varanasi Division", "GDS BPM", "SC", 1),
      ("Kiran Kumar", "KA001", "Karnataka", "Bengaluru Division", "GDS BPM", "UR", 1),
      ("Lakshmi Devi", "KA002", "Karnataka", "Mysuru Division", "GDS BPM", "OBC", 1),
      ("Murugan S", "TN001", "Tamil Nadu", "Chennai Division", "GDS BPM", "UR", 1),
      ("Kavitha R", "TN002", "Tamil Nadu", "Coimbatore Division", "GDS BPM", "SC", 1),
      ("Deepak Gupta", "DL001", "Delhi", "North Delhi Division", "GDS BPM", "UR", 1),
      ("Rekha Yadav", "DL002", "Delhi", "South Delhi Division", "GDS BPM", "OBC", 1),
    ];
    var appId : Nat = 0;
    for ((name, roll, state, division, _cat, category, rank) in candidateData.vals()) {
      let id = nextCandidateId;
      nextCandidateId += 1;
      candidates.add(id, {
        id = id;
        applicationId = appId;
        candidateName = name;
        rollNumber = roll;
        state = state;
        circle = state # " Circle";
        division = division;
        category = category;
        rank = rank;
      });
      appId += 1;
    };
  };

  func seedOfficialUpdates() {
    // Timestamps in nanoseconds for specific dates
    // Schedule-3: 15.01.2026 ~ 1768512000_000_000_000
    // Schedule-2: 01.10.2025 ~ 1759315200_000_000_000
    // Schedule-1: 01.06.2025 ~ 1748736000_000_000_000
    // Tender dates: 2025 range
    // Official letter dates: 2024-2025 range
    let seedData : [(Text, Text, Types.UpdateCategory, Int)] = [
      // Official Letters (sorted newest first)
      (
        "Circular: Document Verification Schedule for GDS Engagement 2025",
        "Candidates shortlisted for document verification under GDS Online Engagement 2025 are directed to report at the designated divisional offices as per the schedule enclosed. Original documents along with self-attested copies are mandatory.",
        #officialLetter,
        1725926400_000_000_000
      ),
      (
        "Official Letter: GDS Engagement Special Drive Schedule-1 Notification",
        "Official communication regarding the launch of Gramin Dak Sevak Online Engagement Special Drive Schedule-1. All eligible candidates are advised to apply online through the official portal before the closing date.",
        #officialLetter,
        1717200000_000_000_000
      ),
      (
        "Office Letter: Revised Eligibility Criteria for GDS Posts 2024",
        "This letter conveys the revised minimum eligibility criteria for GDS Branch Postmaster and Assistant Branch Postmaster posts effective from June 2024, including updated age relaxation norms for reserved categories.",
        #officialLetter,
        1710460800_000_000_000
      ),
      // Tenders (sorted newest first)
      (
        "Tender Notice: Printing of GDS Application Forms and Acknowledgement Slips 2025",
        "Quotations are invited from government-empanelled printers for printing of GDS Online Engagement application forms, acknowledgement slips and official stationery for the year 2025-26. Details available at the office.",
        #tender,
        1743465600_000_000_000
      ),
      (
        "Tender: Annual Maintenance Contract for CCTV Systems — RO Jabalpur",
        "Tenders are invited for Annual Maintenance Contract (AMC) for CCTV surveillance systems installed at Regional Office Jabalpur and its subordinate offices. Interested parties may collect tender documents from the office.",
        #tender,
        1740700800_000_000_000
      ),
      (
        "Tender Notice: Supply of IT Equipment for Post Offices — MP Circle 2024",
        "Sealed tenders are invited from registered vendors for the supply and installation of computers, printers and network equipment at post offices under Madhya Pradesh Circle. Last date for submission: 30 days from publication.",
        #tender,
        1732060800_000_000_000
      ),
      // Recruitment — sorted newest to oldest: Schedule-3, Schedule-2, Schedule-1
      (
        "Recruitment: Gramin Dak Sevak (GDS) Online Engagement Special Drive schedule 3 (15.01.2026)",
        "Gramin Dak Sevak Online Engagement Special Drive Schedule-3 advertisement published. Eligible candidates from all states may apply for GDS Branch Postmaster and Assistant Branch Postmaster posts. Apply before the closing date.",
        #recruitment,
        1768512000_000_000_000
      ),
      (
        "Recruitment: Gramin Dak Sevak (GDS) Online Engagement Special Drive schedule 2 (01.10.2025)",
        "Gramin Dak Sevak Online Engagement Special Drive Schedule-2 notification released. This drive covers vacancies arising due to withdrawal, non-joining and additional posts across various postal circles. Check circle-wise vacancy details.",
        #recruitment,
        1759315200_000_000_000
      ),
      (
        "Recruitment: Gramin Dak Sevak (GDS) Online Engagement Special Drive schedule 1 (01.06.2025)",
        "Gramin Dak Sevak Online Engagement Special Drive Schedule-1 is open for applications. Candidates with Class 10 pass certificates from recognized boards may apply for BPM and ABPM posts across all circles. Apply at the official portal.",
        #recruitment,
        1748736000_000_000_000
      ),
    ];
    for ((title, content, category, dateNs) in seedData.vals()) {
      let id = nextOfficialUpdateId.toText();
      nextOfficialUpdateId += 1;
      officialUpdates.add(id, {
        id = id;
        title = title;
        content = content;
        category = category;
        date = dateNs;
        pdfUrl = null;
        isNew = (dateNs > 1740000000_000_000_000);
        isActive = true;
        createdBy = "system";
      });
    };
  };

  // Run seed once on first deploy
  if (not seedDone) {
    seedDone := true;
    seedNotifications();
    seedCircles();
    seedCandidates();
    seedOfficialUpdates();
  };

  // ─── Mixin Inclusion ─────────────────────────────────────────────────────────
  include UsersApi(users, principalIndex, nextUserId);
  include OtpApi(otps, nextOtpId, users, principalIndex);
  include ApplicationsApi(applications, users, principalIndex, nextApplicationId);
  include PaymentsApi(payments, applications, principalIndex, users, nextPaymentId);
  include NotificationsApi(notifications, principalIndex, users, nextNotificationId);
  include CirclesApi(circles, principalIndex, users, nextCircleId);
  include CandidatesApi(candidates, principalIndex, users, nextCandidateId);
  include AdminApi(adminCandidatesV2, adminDocumentsV3, adminVacanciesV2);
  include CandidateAuthApi(adminCandidatesV2);
  include OfficialUpdatesApi(officialUpdates, principalIndex, users, nextOfficialUpdateId);

  // ─── AI Chatbot (HTTP Outcalls via IC Management Canister) ───────────────────

  // IC management canister HTTP outcall types
  type HttpHeader = { name : Text; value : Text };
  type HttpMethod = { #get; #post; #head };
  type TransformArgs = { context : Blob; response : HttpResponse };
  type TransformFn = shared query TransformArgs -> async HttpResponse;
  type TransformContext = { function : TransformFn; context : Blob };
  type HttpRequest = {
    url : Text;
    max_response_bytes : ?Nat64;
    headers : [HttpHeader];
    body : ?Blob;
    method : HttpMethod;
    transform : ?TransformContext;
  };
  type HttpResponse = {
    status : Nat;
    headers : [HttpHeader];
    body : Blob;
  };

  let IC = actor "aaaaa-aa" : actor {
    http_request : HttpRequest -> async HttpResponse;
  };

  public query func httpTransform(args : { context : Blob; response : HttpResponse }) : async HttpResponse {
    { args.response with headers = [] }
  };

  public shared func chatWithAI(message : Text) : async Text {
    let url = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";
    let body = "{\"inputs\": \"" # message # "\"}";
    let bodyBlob = body.encodeUtf8();
    let request : HttpRequest = {
      url = url;
      max_response_bytes = ?(10_000 : Nat64);
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Accept"; value = "application/json" },
      ];
      body = ?bodyBlob;
      method = #post;
      transform = ?{ function = httpTransform; context = "".encodeUtf8() };
    };
    try {
      let response = await IC.http_request(request);
      switch (response.body.decodeUtf8()) {
        case (?text) { text };
        case null { "Sorry, I couldn't decode the response." };
      }
    } catch (_e) {
      "Sorry, the AI service is temporarily unavailable. Please try again later."
    }
  };
};
