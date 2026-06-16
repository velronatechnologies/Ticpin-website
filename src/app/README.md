# Tickpin Next.js Route & File Security Audit Index

This index categorizes and documents each of the **199 `.tsx` files** found under `src/app/`, defining their exact security status (Public, Private, Layout, or Component).

---

## 🛡️ Global Security Status Breakdown

*   **Public Route**: Fully viewable by unauthenticated web visitors and indexed by search engine crawlers.
*   **Private - User**: Requires active customer mobile OTP session. Automatically triggers the `AuthModal` login workflow or redirects to the appropriate page when unauthenticated.
*   **Private - Organizer**: Requires verified vendor/host OTP session to access listing creators, payout panels, and venue editors.
*   **Private - Admin**: Platform administrator credentials required. Controls offers, global pass parameters, support reply lines, and user activity reviews.
*   **System Layout / Component**: Structural code or localized interface blocks that do not resolve to standalone public endpoints.

---

## 📂 Detailed File Index (All 199 Files)

### 1. General & Platform Core Pages (12 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/page.tsx` | Main platform homepage | Route | `Public` |
| `src/app/HomeClient.tsx` | Client homepage category selector | Component | `Public` |
| `src/app/layout.tsx` | Root layout shell | System Layout | `Public` |
| `src/app/loading.tsx` | Global loading boundary skeleton | Skeleton | `Public` |
| `src/app/error.tsx` | Global error boundary | System | `Public` |
| `src/app/not-found.tsx` | Global 404 handler | System | `Public` |
| `src/app/privacy/page.tsx` | Privacy Policy document | Route | `Public` |
| `src/app/terms/page.tsx` | Terms & Conditions agreement | Route | `Public` |
| `src/app/refund/page.tsx` | Refund & Cancellations Policy | Route | `Public` |
| `src/app/contact/page.tsx` | Support contact coordinates | Route | `Public` |
| `src/app/logout/page.tsx` | Clear session and redirect endpoint | System | `Public` |
| `src/app/chat-with-us/page.tsx` | Direct customer text chat line | Route | `Public` |

---

### 2. Events Module (23 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/events/page.tsx` | Global events portal index | Route | `Public` |
| `src/app/events/layout.tsx` | Events root layout container | System Layout | `Public` |
| `src/app/events/loading.tsx` | Events category loading state | Skeleton | `Public` |
| `src/app/events/EventsClient.tsx` | Client event loader | Component | `Public` |
| `src/app/events/EventsGrid.tsx` | Grid displaying individual event cards | Component | `Public` |
| `src/app/events/EventCategoryClient.tsx` | Filtered events display controller | Component | `Public` |
| `src/app/events/ArtistsSection.tsx` | Guest artists display row | Component | `Public` |
| `src/app/events/comedy/page.tsx` | Comedy Events catalog | Route | `Public` |
| `src/app/events/music/page.tsx` | Concerts & Gig listings | Route | `Public` |
| `src/app/events/sports/page.tsx` | Sports events listing catalog | Route | `Public` |
| `src/app/events/performance/page.tsx` | Theatre & Live acts catalog | Route | `Public` |
| `src/app/events/fests-fairs/page.tsx` | Fairs, expos, and festivals catalog | Route | `Public` |
| `src/app/events/food-drinks/page.tsx` | Food crawls & brewery events | Route | `Public` |
| `src/app/events/fitness/page.tsx` | Workouts, marathons, yoga meetups | Route | `Public` |
| `src/app/events/night-life/page.tsx` | Nightclub parties & DJ lineups | Route | `Public` |
| `src/app/events/open-mic/page.tsx` | Poetry, storytelling, poetry slams | Route | `Public` |
| `src/app/events/screenings/page.tsx` | Movie, anime, sports match watchalongs | Route | `Public` |
| `src/app/events/artist/[id]/page.tsx` | Individual Artist detail dossier | Route | `Public` |
| `src/app/events/[name]/page.tsx` | Target event detail summary | Route | `Public` |
| `src/app/events/[name]/loading.tsx` | Event summary load state | Skeleton | `Public` |
| `src/app/events/[name]/EventDetailClient.tsx` | Client event interactive detail layer | Component | `Public` |
| `src/app/events/[name]/book/page.tsx` | **Ticket selection** (Blocked on mount if unauthenticated) | Route | `Private - User` |
| `src/app/events/[name]/book/tickets/page.tsx` | Detailed checkout attendee sheet | Route | `Private - User` |
| `src/app/events/[name]/book/review/page.tsx` | Ticket checkout payment stage | Route | `Private - User` |
| `src/app/events/[name]/book/review/SuccessView.tsx` | Booking successful invoice splash | Component | `Private - User` |
| `src/app/events/create/page.tsx` | Create a new event | Route | `Private - Organizer` |
| `src/app/events/edit/[id]/page.tsx` | Modify existing event details | Route | `Private - Organizer` |

---

### 3. Dining Module (17 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/dining/page.tsx` | Dining listings hub | Route | `Public` |
| `src/app/dining/layout.tsx` | Dining portal layout | System Layout | `Public` |
| `src/app/dining/loading.tsx` | Dining index loader | Skeleton | `Public` |
| `src/app/dining/DiningClient.tsx` | Client category switcher | Component | `Public` |
| `src/app/dining/pure-veg/page.tsx` | Veg-only restaurants catalog | Route | `Public` |
| `src/app/dining/premium-dining/page.tsx` | Fine dining reservation list | Route | `Public` |
| `src/app/dining/bar-bites/page.tsx` | Pubs, bistros, and tapas bars | Route | `Public` |
| `src/app/dining/cafe-vibes/page.tsx` | Coffee shops and work-cafes list | Route | `Public` |
| `src/app/dining/club-chill/page.tsx` | Lounges and late-night clubs list | Route | `Public` |
| `src/app/dining/family-favourites/page.tsx` | Family restaurants index | Route | `Public` |
| `src/app/dining/venue/[name]/page.tsx` | Restaurant profile & details | Route | `Public` |
| `src/app/dining/venue/[name]/loading.tsx` | Restaurant detailed loading screen | Skeleton | `Public` |
| `src/app/dining/venue/[name]/DiningVenueDetailClient.tsx` | Interactive slot view | Component | `Public` |
| `src/app/dining/venue/[name]/book/page.tsx` | **Slot & Guests Selection** (Blocked on mount if unauthenticated) | Route | `Private - User` |
| `src/app/dining/venue/[name]/book/review/page.tsx` | Restaurant payment summary page | Route | `Private - User` |
| `src/app/dining/create/page.tsx` | Setup a new dining profile | Route | `Private - Organizer` |
| `src/app/dining/edit/[id]/page.tsx` | Edit restaurant profile parameters | Route | `Private - Organizer` |

---

### 4. Play Module (26 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/play/page.tsx` | Play venues & turf directory | Route | `Public` |
| `src/app/play/layout.tsx` | Play section layout container | System Layout | `Public` |
| `src/app/play/loading.tsx` | Play directory loading skeleton | Skeleton | `Public` |
| `src/app/play/PlayClient.tsx` | Client list manager | Component | `Public` |
| `src/app/play/CategoryClient.tsx` | Selected sports filter client | Component | `Public` |
| `src/app/play/cricket/page.tsx` | Cricket nets & box pitches list | Route | `Public` |
| `src/app/play/pickleball/page.tsx` | Pickleball courts directory | Route | `Public` |
| `src/app/play/badminton/page.tsx` | Badminton courts directory | Route | `Public` |
| `src/app/play/tennis/page.tsx` | Tennis clay/synthetic courts index | Route | `Public` |
| `src/app/play/basketball/page.tsx` | Basketball indoor/outdoor courts | Route | `Public` |
| `src/app/play/table-tennis/page.tsx` | Ping-pong tables directory | Route | `Public` |
| `src/app/play/football/page.tsx` | Football turfs (5-a-side / 7-a-side) | Route | `Public` |
| `src/app/play/[name]/page.tsx` | Sports venue listing showcase page | Route | `Public` |
| `src/app/play/[name]/loading.tsx` | Play venue detail skeleton | Skeleton | `Public` |
| `src/app/play/[name]/PlayDetailClient.tsx` | Interactive turf slot manager | Component | `Public` |
| `src/app/play/[name]/book/page.tsx` | **Court selection** (Blocked on mount if unauthenticated) | Route | `Private - User` |
| `src/app/play/[name]/book/review/page.tsx` | Play venue payment review page | Route | `Private - User` |
| `src/app/play/create/page.tsx` | Create a play venue | Route | `Private - Organizer` |
| `src/app/play/create/format/page.tsx` | Choose pricing format | Route | `Private - Organizer` |
| `src/app/play/create/format-fixed.tsx` | Pricing configuration layer (Fixed) | Component | `Private - Organizer` |
| `src/app/play/create/format-fixed-corrected.tsx` | Validated fixed pricing configuration | Component | `Private - Organizer` |
| `src/app/play/create/manage/page.tsx` | Manage venue listings dashboard | Route | `Private - Organizer` |
| `src/app/play/create/manage/[id]/page.tsx` | Target listing slot scheduler | Route | `Private - Organizer` |
| `src/app/play/edit/[id]/page.tsx` | Edit turf/court details | Route | `Private - Organizer` |
| `src/app/play/edit/[id]/format/page.tsx` | Edit pricing configurations | Route | `Private - Organizer` |
| `src/app/play/edit/[id]/manage/page.tsx` | Edit live schedule controls | Route | `Private - Organizer` |

---

### 5. Bookings & Ticket Verification Flow (17 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/bookings/page.tsx` | Interactive index of past transactions | Route | `Private - User` |
| `src/app/bookings/[id]/page.tsx` | Individual invoice & barcode details | Route | `Private - User` |
| `src/app/bookings/dining/page.tsx` | Past restaurant bookings index | Route | `Private - User` |
| `src/app/bookings/dining/[id]/page.tsx` | Restaurant booking verification | Route | `Private - User` |
| `src/app/bookings/dining-tickets/page.tsx` | Diners ticket details page | Route | `Private - User` |
| `src/app/bookings/events/page.tsx` | Past event passes directory | Route | `Private - User` |
| `src/app/bookings/events/[id]/page.tsx` | Event ticket status check | Route | `Private - User` |
| `src/app/bookings/event-tickets/page.tsx` | Attendee passes list view | Route | `Private - User` |
| `src/app/bookings/play/page.tsx` | Past turf slot reservations index | Route | `Private - User` |
| `src/app/bookings/play/[id]/page.tsx` | Turf slot confirmation status | Route | `Private - User` |
| `src/app/bookings/play-tickets/page.tsx` | Play venue entry passes | Route | `Private - User` |
| `src/app/ticket/[id]/page.tsx` | Scannable entry barcode page | Route | `Private - User` |
| `src/app/qr-verify/[id]/page.tsx` | **Public ticket verification screen** (Scan & verify) | Route | `Public` |
| `src/app/my-pass/page.tsx` | Active premium passes listing | Route | `Private - User` |
| `src/app/pass/page.tsx` | Buy Membership description sheet | Route | `Public` |
| `src/app/pass/buy/page.tsx` | Complete Pass membership acquisition | Route | `Private - User` |
| `src/app/ticpass/page.tsx` | Ticpin Pass purchase page | Route | `Public` |
| `src/app/ticpass/success/page.tsx` | Membership success screen | Route | `Private - User` |

---

### 6. User Profile Dashboard (8 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/profile/page.tsx` | User Account Overview dashboard | Route | `Private - User` |
| `src/app/profile/edit/page.tsx` | Update name, phone, and profile photo | Route | `Private - User` |
| `src/app/profile/settings/page.tsx` | User configurations and cookies | Route | `Private - User` |
| `src/app/profile/pass/page.tsx` | View dynamic active premium pass | Route | `Private - User` |
| `src/app/profile/bookings/page.tsx` | History overview | Route | `Private - User` |
| `src/app/profile/bookings/dining/page.tsx` | User past dining table listings | Route | `Private - User` |
| `src/app/profile/bookings/events/page.tsx` | User past event concert tickets | Route | `Private - User` |
| `src/app/profile/bookings/play/page.tsx` | User past turf bookings history | Route | `Private - User` |

---

### 7. Support & Live Assist Module (3 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/chat-support/page.tsx` | Active live-support text dashboard | Route | `Public` / `User` |
| `src/app/chat-support/ChatSupportClient.tsx` | Live connection stream supervisor | Component | `Public` / `User` |
| `src/app/chat-support/session/page.tsx` | Active connection chat screen | Route | `Public` / `User` |

---

### 8. List Your Venue/Business (Organizer Onboarding) (34 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/list-your-events/page.tsx` | Publisher events landing pitch | Route | `Public` |
| `src/app/list-your-events/Signin/page.tsx` | Event host sign-in page | Route | `Public` |
| `src/app/list-your-events/Login/page.tsx` | Event host signup details | Route | `Public` |
| `src/app/list-your-events/otp/page.tsx` | Host OTP verification screen | Route | `Public` |
| `src/app/list-your-events/setup/page.tsx` | Basic organization registration | Route | `Private - Organizer` |
| `src/app/list-your-events/setup/layout.tsx` | Onboarding stepper layout | System Layout | `Private - Organizer` |
| `src/app/list-your-events/setup/gst/page.tsx` | Company GST registration verification | Route | `Private - Organizer` |
| `src/app/list-your-events/setup/bank/page.tsx` | Payout banking integration setup | Route | `Private - Organizer` |
| `src/app/list-your-events/setup/backup/page.tsx` | Backup contacts configuration page | Route | `Private - Organizer` |
| `src/app/list-your-events/setup/agreement/page.tsx` | Sign platform host terms | Route | `Private - Organizer` |
| `src/app/list-your-events/list-your-Setups/SetupSidebar.tsx` | Onboarding progress drawer | Component | `Private - Organizer` |
| `src/app/list-your-events/list-your-Setups/CreatorSteps.tsx` | Current stepper state indicator | Component | `Private - Organizer` |
| `src/app/list-your-dining/page.tsx` | Restaurant partner pitching deck | Route | `Public` |
| `src/app/list-your-dining/Signin/page.tsx` | Restaurant manager OTP login | Route | `Public` |
| `src/app/list-your-dining/Login/page.tsx` | Restaurant details profile signup | Route | `Public` |
| `src/app/list-your-dining/otp/page.tsx` | Dining partner OTP check | Route | `Public` |
| `src/app/list-your-dining/setup/page.tsx` | Dining setup basic parameters | Route | `Private - Organizer` |
| `src/app/list-your-dining/setup/layout.tsx` | Dining onboarding shell layout | System Layout | `Private - Organizer` |
| `src/app/list-your-dining/setup/gst/page.tsx` | Restaurant GST information check | Route | `Private - Organizer` |
| `src/app/list-your-dining/setup/bank/page.tsx` | Banking deposits details validation | Route | `Private - Organizer` |
| `src/app/list-your-dining/setup/backup/page.tsx` | Secondary restaurant manager contacts | Route | `Private - Organizer` |
| `src/app/list-your-dining/setup/agreement/page.tsx` | Diner platform agreements | Route | `Private - Organizer` |
| `src/app/list-your-dining/list-your-Setups/SetupSidebar.tsx` | Onboarding progress sidebar | Component | `Private - Organizer` |
| `src/app/list-your-dining/list-your-Setups/CreatorSteps.tsx` | Onboarding tracker indicators | Component | `Private - Organizer` |
| `src/app/list-your-play/page.tsx` | Turf operator onboarding landing | Route | `Public` |
| `src/app/list-your-play/Signin/page.tsx` | Turf partner initial sign in | Route | `Public` |
| `src/app/list-your-play/Login/page.tsx` | Turf venue setup registration | Route | `Public` |
| `src/app/list-your-play/otp/page.tsx` | Play partner OTP validation | Route | `Public` |
| `src/app/list-your-play/setup/page.tsx` | Turf setup basic details | Route | `Private - Organizer` |
| `src/app/list-your-play/setup/layout.tsx` | Play onboarding stepper wrapper | System Layout | `Private - Organizer` |
| `src/app/list-your-play/setup/gst/page.tsx` | Turf GST documentation validation | Route | `Private - Organizer` |
| `src/app/list-your-play/setup/bank/page.tsx` | Bank account billing registration | Route | `Private - Organizer` |
| `src/app/list-your-play/setup/backup/page.tsx` | Secondary manager numbers setup | Route | `Private - Organizer` |
| `src/app/list-your-play/setup/agreement/page.tsx` | Turf operator digital contract | Route | `Private - Organizer` |
| `src/app/list-your-play/list-your-Setups/SetupSidebar.tsx` | Stepper progress indicator | Component | `Private - Organizer` |
| `src/app/list-your-play/list-your-Setups/CreatorSteps.tsx` | Current turf stepper visual state | Component | `Private - Organizer` |

---

### 9. Organizer Dashboard (5 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/organizer/page.tsx` | Primary organizer landing | Route | `Private - Organizer` |
| `src/app/organizer/dashboard/page.tsx` | Live listing ticket sales analytics | Route | `Private - Organizer` |
| `src/app/organizer/analytics/page.tsx` | Detailed sales reports & payouts tracker | Route | `Private - Organizer` |
| `src/app/organizer/profile/page.tsx` | Host personal profile parameters | Route | `Private - Organizer` |
| `src/app/organizer/payouts/page.tsx` | Request and review host bank transfers | Route | `Private - Organizer` |

---

### 10. Platform Administration Dashboard (57 Files)

| File Path | Description | Classification | Security Status |
| :--- | :--- | :--- | :--- |
| `src/app/admin/page.tsx` | Global administration dashboard homepage | Route | `Private - Admin` |
| `src/app/admin/layout.tsx` | Admin control panel navigation and grid shell | System Layout | `Private - Admin` |
| `src/app/admin/events/page.tsx` | Administrative review of live musical/comedy events | Route | `Private - Admin` |
| `src/app/admin/dining/page.tsx` | Administrative approval sheet for restaurant slots | Route | `Private - Admin` |
| `src/app/admin/play/page.tsx` | Turf slot availability review console | Route | `Private - Admin` |
| `src/app/admin/play/[id]/format/page.tsx` | Adjust price matrices for target play fields | Route | `Private - Admin` |
| `src/app/admin/payouts/page.tsx` | Review and verify payout requests to bank API | Route | `Private - Admin` |
| `src/app/admin/push-notification/page.tsx` | Send target platform-wide push/SMS bulletins | Route | `Private - Admin` |
| `src/app/admin/chat-sessions/page.tsx` | Review current active live support tickets | Route | `Private - Admin` |
| `src/app/admin/organizers/page.tsx` | Approve host registrations and tax logs | Route | `Private - Admin` |
| `src/app/admin/organizers/[id]/pan-card/page.tsx` | Document verification checklist for pan | Route | `Private - Admin` |
| `src/app/admin/user-details/page.tsx` | Main user listing search database panel | Route | `Private - Admin` |
| `src/app/admin/user-details-view/page.tsx` | Quick profile inspector dialog | Route | `Private - Admin` |
| `src/app/admin/user-details-view-next/page.tsx` | Full details audit interface | Route | `Private - Admin` |
| `src/app/admin/user-details-activity/page.tsx` | View logged sessions and clicks history | Route | `Private - Admin` |
| `src/app/admin/user-details-bookings/page.tsx` | User history list view | Route | `Private - Admin` |
| `src/app/admin/user-details-offers/page.tsx` | List offers and coupons utilized | Route | `Private - Admin` |
| `src/app/admin/user-details-ticlists/page.tsx` | User saved wishlists display sheet | Route | `Private - Admin` |
| `src/app/admin/UserDetails/userdetail1.tsx` | Sub-component layout for profile inspect | Component | `Private - Admin` |
| `src/app/admin/UserDetails/userDetails2.tsx` | User activity data chart components | Component | `Private - Admin` |
| `src/app/admin/UserDetails/userdetails2.1.tsx` | Extended transaction activity metrics | Component | `Private - Admin` |
| `src/app/admin/UserDetails/userdetails2.2.tsx` | Profile actions sub-block | Component | `Private - Admin` |
| `src/app/admin/UserDetails/userdetails3.tsx` | Active device metrics component | Component | `Private - Admin` |
| `src/app/admin/UserDetails/userdetails4.tsx` | User-associated coupons and promotions list | Component | `Private - Admin` |
| `src/app/admin/UserDetails/userdetails5.tsx` | Dynamic wishlists sub-panel layout | Component | `Private - Admin` |
| `src/app/admin/pass/page.tsx` | Global Premium passes controller | Route | `Private - Admin` |
| `src/app/admin/pass/layout.tsx` | Admin pass layout wrapper | System Layout | `Private - Admin` |
| `src/app/admin/pass/create/page.tsx` | Create new Ticpin Premium passport schema | Route | `Private - Admin` |
| `src/app/admin/pass/view/page.tsx` | Live list of active passes sold | Route | `Private - Admin` |
| `src/app/admin/offers/page.tsx` | Global promotions management grid | Route | `Private - Admin` |
| `src/app/admin/offers/layout.tsx` | Admin offers layout wrapper | System Layout | `Private - Admin` |
| `src/app/admin/offers/create/page.tsx` | Create promotions selection panel | Route | `Private - Admin` |
| `src/app/admin/offers/create/createoffer.tsx` | Standard discount configurations panel | Component | `Private - Admin` |
| `src/app/admin/offers/create/createcoupon.tsx` | Coupon validations configurations panel | Component | `Private - Admin` |
| `src/app/admin/offers/createoffer/page.tsx` | Add a direct checkout venue offer | Route | `Private - Admin` |
| `src/app/admin/offers/createcoupon/page.tsx` | Generate custom referral/promo codes | Route | `Private - Admin` |
| `src/app/admin/offers/view/page.tsx` | Live promotions viewer index | Route | `Private - Admin` |
| `src/app/admin/offers/view/viewoffer.tsx` | Offers inspector layout | Component | `Private - Admin` |
| `src/app/admin/offers/view/viewcoupon.tsx` | Coupon inspector details panel | Component | `Private - Admin` |
| `src/app/admin/offers/viewoffer/page.tsx` | View/Edit details for target live offer | Route | `Private - Admin` |
| `src/app/admin/offers/viewcoupon/page.tsx` | View/Edit configurations of target coupon | Route | `Private - Admin` |
| `src/app/admin/ChatSupportPage/page.tsx` | Customer support live chat dispatcher | Route | `Private - Admin` |
| `src/app/admin/ChatSupportPage/chatSupport.tsx` | Interactive multi-room chat stream client | Component | `Private - Admin` |
| `src/app/admin/ChatSupportPage/chatsupporReplyPage.tsx` | Operator fast reply panel layout | Component | `Private - Admin` |
| `src/app/admin/ChatSupportPage/reply/page.tsx` | Respond to a selected support ticket | Route | `Private - Admin` |
| `src/app/admin/ChatSupportPage/chatSupport_old.tsx` | Legacy chat stream layout | Component (Dep) | `Private - Admin` |
| `src/app/admin/ChatSupportPage/chatsupporReplyPage_old.tsx` | Legacy quick replies sheet | Component (Dep) | `Private - Admin` |
