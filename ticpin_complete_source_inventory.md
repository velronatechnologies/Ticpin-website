# Ticpin Complete Codebase Source Inventory (814 Files)

This document contains the complete, bottom-to-top inventory of all source files in the Ticpin workspace (including `postgresbackend`, `ticpin` dashboard, and `Scanner` app). It lists the relative path, directory context, and file size for every single source script.

---

## Workspace Source Map

| File Path | Description | Size |
| :--- | :--- | :--- |
| `Scanner/next-env.d.ts` | Scanner app Next.js source code | 0.25 KB |
| `Scanner/next.config.ts` | Scanner app Next.js source code | 0.34 KB |
| `Scanner/src/app/home/page.tsx` | Scanner app Next.js source code | 15.77 KB |
| `Scanner/src/app/layout.tsx` | Scanner app Next.js source code | 1.13 KB |
| `Scanner/src/app/not-found.tsx` | Scanner app Next.js source code | 0.11 KB |
| `Scanner/src/app/page.tsx` | Scanner app Next.js source code | 105.05 KB |
| `Scanner/src/app/profile/page.tsx` | Scanner app Next.js source code | 18.39 KB |
| `postgresbackend/add_indexes.go` | Source file | 3.36 KB |
| `postgresbackend/api/index.go` | Source file | 0.55 KB |
| `postgresbackend/cache/cache.go` | Source file | 0.12 KB |
| `postgresbackend/cache/manager.go` | Source file | 3.42 KB |
| `postgresbackend/cache/memory.go` | Source file | 6.78 KB |
| `postgresbackend/cache/redis.go` | Source file | 5.91 KB |
| `postgresbackend/cache/redislock.go` | Source file | 5.17 KB |
| `postgresbackend/cache/watch.go` | Source file | 0.42 KB |
| `postgresbackend/clear_cache.go` | Source file | 0.48 KB |
| `postgresbackend/cmd/seed_admin/main.go` | Source file | 1.43 KB |
| `postgresbackend/config/app_config.go` | Backend configuration & external SDK clients | 2.37 KB |
| `postgresbackend/config/cloudinary.go` | Backend configuration & external SDK clients | 4.35 KB |
| `postgresbackend/config/database.go` | Backend configuration & external SDK clients | 1.25 KB |
| `postgresbackend/config/firebase_admin.go` | Backend configuration & external SDK clients | 4.70 KB |
| `postgresbackend/config/jwt.go` | Backend configuration & external SDK clients | 6.49 KB |
| `postgresbackend/config/mailer.go` | Backend configuration & external SDK clients | 19.57 KB |
| `postgresbackend/config/whatsapp.go` | Backend configuration & external SDK clients | 4.00 KB |
| `postgresbackend/controller/admin/auth/auth.go` | Backend controller logic / request handlers | 2.05 KB |
| `postgresbackend/controller/admin/coupon/coupon.go` | Backend controller logic / request handlers | 5.63 KB |
| `postgresbackend/controller/admin/listings/listings.go` | Backend controller logic / request handlers | 8.05 KB |
| `postgresbackend/controller/admin/notification/notification.go` | Backend controller logic / request handlers | 0.81 KB |
| `postgresbackend/controller/admin/offer/offer.go` | Backend controller logic / request handlers | 6.99 KB |
| `postgresbackend/controller/admin/organizers/organizers.go` | Backend controller logic / request handlers | 9.26 KB |
| `postgresbackend/controller/admin/pan/pan.go` | Backend controller logic / request handlers | 7.73 KB |
| `postgresbackend/controller/admin/pass/pass.go` | Backend controller logic / request handlers | 6.65 KB |
| `postgresbackend/controller/admin/payouts/payouts.go` | Backend controller logic / request handlers | 15.75 KB |
| `postgresbackend/controller/admin/receiptverification/verification.go` | Backend controller logic / request handlers | 9.92 KB |
| `postgresbackend/controller/admin/stats/stats.go` | Backend controller logic / request handlers | 0.38 KB |
| `postgresbackend/controller/admin/users/users.go` | Backend controller logic / request handlers | 7.38 KB |
| `postgresbackend/controller/auth/auth.go` | Backend controller logic / request handlers | 2.43 KB |
| `postgresbackend/controller/booking/details.go` | Backend controller logic / request handlers | 13.76 KB |
| `postgresbackend/controller/booking/dining.go` | Backend controller logic / request handlers | 14.07 KB |
| `postgresbackend/controller/booking/event.go` | Backend controller logic / request handlers | 16.92 KB |
| `postgresbackend/controller/booking/lock.go` | Backend controller logic / request handlers | 3.31 KB |
| `postgresbackend/controller/booking/play.go` | Backend controller logic / request handlers | 20.19 KB |
| `postgresbackend/controller/booking/reservation.go` | Backend controller logic / request handlers | 14.84 KB |
| `postgresbackend/controller/booking/user/cancel.go` | Backend controller logic / request handlers | 13.49 KB |
| `postgresbackend/controller/booking/user/history.go` | Backend controller logic / request handlers | 12.50 KB |
| `postgresbackend/controller/cache/cache.go` | Backend controller logic / request handlers | 0.89 KB |
| `postgresbackend/controller/dining/dining.go` | Backend controller logic / request handlers | 1.01 KB |
| `postgresbackend/controller/event/event.go` | Backend controller logic / request handlers | 1.87 KB |
| `postgresbackend/controller/mobile/bookings.go` | Backend controller logic / request handlers | 1.77 KB |
| `postgresbackend/controller/mobile/mobile.go` | Backend controller logic / request handlers | 4.25 KB |
| `postgresbackend/controller/newadmin/newadmin.go` | Backend controller logic / request handlers | 16.82 KB |
| `postgresbackend/controller/organizer/auth/auth.go` | Backend controller logic / request handlers | 5.07 KB |
| `postgresbackend/controller/organizer/dining/dining.go` | Backend controller logic / request handlers | 6.63 KB |
| `postgresbackend/controller/organizer/dining/dining_crud.go` | Backend controller logic / request handlers | 3.04 KB |
| `postgresbackend/controller/organizer/events/event_crud.go` | Backend controller logic / request handlers | 3.01 KB |
| `postgresbackend/controller/organizer/events/events.go` | Backend controller logic / request handlers | 6.63 KB |
| `postgresbackend/controller/organizer/media/media.go` | Backend controller logic / request handlers | 6.47 KB |
| `postgresbackend/controller/organizer/overview/attendes/attendes.go` | Backend controller logic / request handlers | 2.15 KB |
| `postgresbackend/controller/organizer/overview/dashboard/overview.go` | Backend controller logic / request handlers | 0.87 KB |
| `postgresbackend/controller/organizer/overview/gatecontrol/gatecontrol.go` | Backend controller logic / request handlers | 4.72 KB |
| `postgresbackend/controller/organizer/overview/myevents/myevents.go` | Backend controller logic / request handlers | 1.51 KB |
| `postgresbackend/controller/organizer/payouts/payouts.go` | Backend controller logic / request handlers | 1.62 KB |
| `postgresbackend/controller/organizer/play/play.go` | Backend controller logic / request handlers | 6.86 KB |
| `postgresbackend/controller/organizer/play/play_crud.go` | Backend controller logic / request handlers | 3.51 KB |
| `postgresbackend/controller/organizer/profile/change_email.go` | Backend controller logic / request handlers | 4.93 KB |
| `postgresbackend/controller/organizer/profile/change_mobile.go` | Backend controller logic / request handlers | 6.51 KB |
| `postgresbackend/controller/organizer/profile/profile.go` | Backend controller logic / request handlers | 6.31 KB |
| `postgresbackend/controller/organizer/verification/verification.go` | Backend controller logic / request handlers | 8.27 KB |
| `postgresbackend/controller/otp/otp.go` | Backend controller logic / request handlers | 2.14 KB |
| `postgresbackend/controller/pass/pass.go` | Backend controller logic / request handlers | 5.09 KB |
| `postgresbackend/controller/payment/cashfree_webhook.go` | Backend controller logic / request handlers | 6.06 KB |
| `postgresbackend/controller/payment/payment.go` | Backend controller logic / request handlers | 4.13 KB |
| `postgresbackend/controller/payment/razorpay_webhook.go` | Backend controller logic / request handlers | 15.24 KB |
| `postgresbackend/controller/play/play.go` | Backend controller logic / request handlers | 1.10 KB |
| `postgresbackend/controller/profile/profile.go` | Backend controller logic / request handlers | 5.26 KB |
| `postgresbackend/controller/scanner/scanner.go` | Backend controller logic / request handlers | 30.04 KB |
| `postgresbackend/controller/user/like.go` | Backend controller logic / request handlers | 3.71 KB |
| `postgresbackend/controller/user/user.go` | Backend controller logic / request handlers | 1.30 KB |
| `postgresbackend/controller/verification/verification.go` | Backend controller logic / request handlers | 1.18 KB |
| `postgresbackend/flush_redis.go` | Source file | 0.49 KB |
| `postgresbackend/main.go` | Source file | 4.08 KB |
| `postgresbackend/middleware/auth.go` | Source file | 4.33 KB |
| `postgresbackend/middleware/auth_ratelimit.go` | Source file | 2.14 KB |
| `postgresbackend/middleware/ratelimit.go` | Source file | 5.05 KB |
| `postgresbackend/middleware/security_audit.go` | Source file | 4.33 KB |
| `postgresbackend/models/admin.go` | Database schema / GORM models | 0.78 KB |
| `postgresbackend/models/audit.go` | Database schema / GORM models | 1.34 KB |
| `postgresbackend/models/booking.go` | Database schema / GORM models | 15.80 KB |
| `postgresbackend/models/chat.go` | Database schema / GORM models | 2.02 KB |
| `postgresbackend/models/coupon.go` | Database schema / GORM models | 1.98 KB |
| `postgresbackend/models/credential_logs.go` | Database schema / GORM models | 1.44 KB |
| `postgresbackend/models/dining.go` | Database schema / GORM models | 6.17 KB |
| `postgresbackend/models/donation.go` | Database schema / GORM models | 1.41 KB |
| `postgresbackend/models/event.go` | Database schema / GORM models | 7.24 KB |
| `postgresbackend/models/event_reservation.go` | Database schema / GORM models | 1.41 KB |
| `postgresbackend/models/gate.go` | Database schema / GORM models | 0.38 KB |
| `postgresbackend/models/gate_control.go` | Database schema / GORM models | 1.16 KB |
| `postgresbackend/models/lock.go` | Database schema / GORM models | 1.69 KB |
| `postgresbackend/models/notification.go` | Database schema / GORM models | 1.33 KB |
| `postgresbackend/models/offer.go` | Database schema / GORM models | 1.09 KB |
| `postgresbackend/models/organizer.go` | Database schema / GORM models | 6.55 KB |
| `postgresbackend/models/otp.go` | Database schema / GORM models | 0.35 KB |
| `postgresbackend/models/pass.go` | Database schema / GORM models | 4.29 KB |
| `postgresbackend/models/payout.go` | Database schema / GORM models | 1.02 KB |
| `postgresbackend/models/play.go` | Database schema / GORM models | 8.82 KB |
| `postgresbackend/models/profile.go` | Database schema / GORM models | 2.75 KB |
| `postgresbackend/models/ticket_qr_token.go` | Database schema / GORM models | 0.46 KB |
| `postgresbackend/models/user.go` | Database schema / GORM models | 0.62 KB |
| `postgresbackend/models/user_like.go` | Database schema / GORM models | 0.79 KB |
| `postgresbackend/models/verification.go` | Database schema / GORM models | 2.56 KB |
| `postgresbackend/models/verifier.go` | Database schema / GORM models | 1.75 KB |
| `postgresbackend/pkg/app/app.go` | App package helper utilities | 11.91 KB |
| `postgresbackend/routes/admin/admin.go` | Backend API router definitions | 5.86 KB |
| `postgresbackend/routes/auth/auth.go` | Backend API router definitions | 0.39 KB |
| `postgresbackend/routes/booking/booking.go` | Backend API router definitions | 2.30 KB |
| `postgresbackend/routes/cache/cache.go` | Backend API router definitions | 0.38 KB |
| `postgresbackend/routes/dining/dining.go` | Backend API router definitions | 0.35 KB |
| `postgresbackend/routes/event/event.go` | Backend API router definitions | 0.35 KB |
| `postgresbackend/routes/mobile/mobile.go` | Backend API router definitions | 1.05 KB |
| `postgresbackend/routes/organizer/attendes/attendes.go` | Backend API router definitions | 0.37 KB |
| `postgresbackend/routes/organizer/dining/dining.go` | Backend API router definitions | 0.91 KB |
| `postgresbackend/routes/organizer/events/events.go` | Backend API router definitions | 0.91 KB |
| `postgresbackend/routes/organizer/gatecontrol/gatecontrol.go` | Backend API router definitions | 0.72 KB |
| `postgresbackend/routes/organizer/myevents/myevents.go` | Backend API router definitions | 0.36 KB |
| `postgresbackend/routes/organizer/organizer.go` | Backend API router definitions | 3.04 KB |
| `postgresbackend/routes/organizer/overview/overview.go` | Backend API router definitions | 0.35 KB |
| `postgresbackend/routes/organizer/play/play.go` | Backend API router definitions | 1.03 KB |
| `postgresbackend/routes/pass/pass.go` | Backend API router definitions | 1.15 KB |
| `postgresbackend/routes/payment/payment.go` | Backend API router definitions | 0.51 KB |
| `postgresbackend/routes/play/play.go` | Backend API router definitions | 0.33 KB |
| `postgresbackend/routes/profile/profile.go` | Backend API router definitions | 0.83 KB |
| `postgresbackend/routes/scanner/scanner.go` | Backend API router definitions | 0.99 KB |
| `postgresbackend/routes/user/user.go` | Backend API router definitions | 1.08 KB |
| `postgresbackend/scratch/check_bookings.go` | Source file | 0.67 KB |
| `postgresbackend/scratch/check_bookings_all.go` | Source file | 0.63 KB |
| `postgresbackend/scratch/check_cats.go` | Source file | 0.53 KB |
| `postgresbackend/scratch/check_cats_status.go` | Source file | 0.53 KB |
| `postgresbackend/scratch/check_db.go` | Source file | 1.70 KB |
| `postgresbackend/scratch/cleanup_categories.go` | Source file | 0.92 KB |
| `postgresbackend/scratch/cleanup_db.go` | Source file | 2.23 KB |
| `postgresbackend/scratch/db_cleanup.go` | Source file | 1.93 KB |
| `postgresbackend/scratch/drop_all_tables.go` | Source file | 0.64 KB |
| `postgresbackend/scratch/fibertest.go` | Source file | 0.80 KB |
| `postgresbackend/scratch/flush_event_cache.go` | Source file | 0.57 KB |
| `postgresbackend/scratch/import_organizers.go` | Source file | 10.31 KB |
| `postgresbackend/scratch/insert_one_rupee_cat.go` | Source file | 0.74 KB |
| `postgresbackend/scratch/inspect_admins.go` | Source file | 0.87 KB |
| `postgresbackend/scratch/inspect_event.go` | Source file | 0.95 KB |
| `postgresbackend/scratch/list_categories.go` | Source file | 0.85 KB |
| `postgresbackend/scratch/list_events.go` | Source file | 0.70 KB |
| `postgresbackend/scratch/print_event.go` | Source file | 0.55 KB |
| `postgresbackend/scratch/run_migrations.go` | Source file | 3.19 KB |
| `postgresbackend/scratch/sync_logs.go` | Source file | 2.35 KB |
| `postgresbackend/scratch/test_date_parsing.go` | Source file | 0.61 KB |
| `postgresbackend/scratch/test_organizers_query.go` | Source file | 0.71 KB |
| `postgresbackend/scratch/test_redis.go` | Source file | 1.19 KB |
| `postgresbackend/scratch/test_redis_cluster.go` | Source file | 1.11 KB |
| `postgresbackend/scratch/update_prices.go` | Source file | 1.02 KB |
| `postgresbackend/scripts/check_bookings.go` | Source file | 1.06 KB |
| `postgresbackend/scripts/check_duplicates.go` | Source file | 1.23 KB |
| `postgresbackend/scripts/check_events.go` | Source file | 0.68 KB |
| `postgresbackend/scripts/check_json.go` | Source file | 0.86 KB |
| `postgresbackend/scripts/check_stale_locks.go` | Source file | 1.38 KB |
| `postgresbackend/scripts/check_turf_arena.go` | Source file | 2.14 KB |
| `postgresbackend/scripts/check_venue_full.go` | Source file | 0.78 KB |
| `postgresbackend/scripts/cleanup_chat_sessions.go` | Source file | 1.30 KB |
| `postgresbackend/scripts/cleanup_event_duplicates.go` | Source file | 1.89 KB |
| `postgresbackend/scripts/cleanup_expired_offers.go` | Source file | 1.03 KB |
| `postgresbackend/scripts/cleanup_locks.go` | Source file | 0.95 KB |
| `postgresbackend/scripts/cleanup_passes.go` | Source file | 0.55 KB |
| `postgresbackend/scripts/cleanup_zero_profiles.go` | Source file | 0.54 KB |
| `postgresbackend/scripts/clear_all_except_organizer.go` | Source file | 1.53 KB |
| `postgresbackend/scripts/clear_database.go` | Source file | 1.11 KB |
| `postgresbackend/scripts/correct_james_setup.go` | Source file | 2.57 KB |
| `postgresbackend/scripts/dump_tables.go` | Source file | 3.88 KB |
| `postgresbackend/scripts/event_audit.go` | Source file | 4.10 KB |
| `postgresbackend/scripts/fix_event_times.go` | Source file | 0.93 KB |
| `postgresbackend/scripts/fix_turf_data.go` | Source file | 0.99 KB |
| `postgresbackend/scripts/get_event_id.go` | Source file | 0.92 KB |
| `postgresbackend/scripts/migrate_gates.go` | Source file | 0.73 KB |
| `postgresbackend/scripts/migrate_organizer_setup.go` | Source file | 0.66 KB |
| `postgresbackend/scripts/migrate_roles.go` | Source file | 1.52 KB |
| `postgresbackend/scripts/remove_verifiers.go` | Source file | 1.14 KB |
| `postgresbackend/scripts/test_agreement_gen.go` | Source file | 0.74 KB |
| `postgresbackend/scripts/test_pan_verification.go` | Source file | 1.16 KB |
| `postgresbackend/scripts/test_pooler.go` | Source file | 1.53 KB |
| `postgresbackend/scripts/test_slot_locks.go` | Source file | 2.38 KB |
| `postgresbackend/services/admin/admin.go` | Backend core service and business logic | 4.51 KB |
| `postgresbackend/services/admin/cascade_delete.go` | Backend core service and business logic | 5.43 KB |
| `postgresbackend/services/booking/booking.go` | Backend core service and business logic | 2.15 KB |
| `postgresbackend/services/booking/confirmation.go` | Backend core service and business logic | 8.38 KB |
| `postgresbackend/services/booking/dining.go` | Backend core service and business logic | 1.18 KB |
| `postgresbackend/services/booking/lock.go` | Backend core service and business logic | 2.41 KB |
| `postgresbackend/services/booking/pdf.go` | Backend core service and business logic | 22.39 KB |
| `postgresbackend/services/booking/play.go` | Backend core service and business logic | 12.68 KB |
| `postgresbackend/services/chat/chat.go` | Backend core service and business logic | 0.49 KB |
| `postgresbackend/services/chat/messages.go` | Backend core service and business logic | 6.87 KB |
| `postgresbackend/services/chat/questions.go` | Backend core service and business logic | 3.13 KB |
| `postgresbackend/services/chat/sessions.go` | Backend core service and business logic | 10.55 KB |
| `postgresbackend/services/chat/utils.go` | Backend core service and business logic | 3.39 KB |
| `postgresbackend/services/coupon/coupon.go` | Backend core service and business logic | 7.37 KB |
| `postgresbackend/services/dining/dining.go` | Backend core service and business logic | 6.63 KB |
| `postgresbackend/services/event/event.go` | Backend core service and business logic | 22.40 KB |
| `postgresbackend/services/mobile/bookings.go` | Backend core service and business logic | 13.35 KB |
| `postgresbackend/services/mobile/mobile.go` | Backend core service and business logic | 3.48 KB |
| `postgresbackend/services/notification/notification.go` | Backend core service and business logic | 4.97 KB |
| `postgresbackend/services/offer/offer.go` | Backend core service and business logic | 3.86 KB |
| `postgresbackend/services/organizer/attendes/attendes.go` | Backend core service and business logic | 14.74 KB |
| `postgresbackend/services/organizer/auth.go` | Backend core service and business logic | 5.65 KB |
| `postgresbackend/services/organizer/gatecontrol/gatecontrol.go` | Backend core service and business logic | 10.67 KB |
| `postgresbackend/services/organizer/myevents/myevents.go` | Backend core service and business logic | 17.59 KB |
| `postgresbackend/services/organizer/organizer.go` | Backend core service and business logic | 0.02 KB |
| `postgresbackend/services/organizer/otp.go` | Backend core service and business logic | 7.36 KB |
| `postgresbackend/services/organizer/overview/overview.go` | Backend core service and business logic | 8.79 KB |
| `postgresbackend/services/organizer/payouts/payouts.go` | Backend core service and business logic | 2.83 KB |
| `postgresbackend/services/organizer/profile.go` | Backend core service and business logic | 0.92 KB |
| `postgresbackend/services/organizer/setup.go` | Backend core service and business logic | 3.02 KB |
| `postgresbackend/services/organizer/status.go` | Backend core service and business logic | 2.34 KB |
| `postgresbackend/services/otp/otp.go` | Backend core service and business logic | 8.56 KB |
| `postgresbackend/services/pass/pass.go` | Backend core service and business logic | 10.97 KB |
| `postgresbackend/services/payment/idempotency.go` | Backend core service and business logic | 1.27 KB |
| `postgresbackend/services/payment/payment.go` | Backend core service and business logic | 13.15 KB |
| `postgresbackend/services/payment/verify.go` | Backend core service and business logic | 8.34 KB |
| `postgresbackend/services/play/play.go` | Backend core service and business logic | 9.06 KB |
| `postgresbackend/services/profile/profile.go` | Backend core service and business logic | 3.76 KB |
| `postgresbackend/services/user/user.go` | Backend core service and business logic | 0.89 KB |
| `postgresbackend/services/verification/cashfree.go` | Backend core service and business logic | 7.75 KB |
| `postgresbackend/services/verification/pdf.go` | Backend core service and business logic | 94.28 KB |
| `postgresbackend/services/verification/verification.go` | Backend core service and business logic | 7.26 KB |
| `postgresbackend/src/index.js` | Source file | 2.47 KB |
| `postgresbackend/tests/smtp_test/main.go` | Source file | 1.56 KB |
| `postgresbackend/utils/hash.go` | Source file | 0.32 KB |
| `postgresbackend/utils/validator.go` | Source file | 6.57 KB |
| `postgresbackend/worker/worker.go` | Source file | 0.99 KB |
| `postgresbackend/wrangler.toml` | Source file | 4.92 KB |
| `ticpin/fix_editor.js` | Source file | 0.77 KB |
| `ticpin/fix_end_time.js` | Source file | 2.96 KB |
| `ticpin/fix_ts.js` | Source file | 0.35 KB |
| `ticpin/next-env.d.ts` | Source file | 0.25 KB |
| `ticpin/next.config.ts` | Source file | 1.71 KB |
| `ticpin/open-next.config.ts` | Source file | 0.44 KB |
| `ticpin/src/app/HomeClient.tsx` | Dashboard Page / Next.js Route | 3.18 KB |
| `ticpin/src/app/admin/ChatSupportPage/chatSupport.tsx` | Dashboard Page / Next.js Route | 5.84 KB |
| `ticpin/src/app/admin/ChatSupportPage/chatSupport_old.tsx` | Dashboard Page / Next.js Route | 4.16 KB |
| `ticpin/src/app/admin/ChatSupportPage/chatsupporReplyPage.tsx` | Dashboard Page / Next.js Route | 22.60 KB |
| `ticpin/src/app/admin/ChatSupportPage/chatsupporReplyPage_old.tsx` | Dashboard Page / Next.js Route | 8.47 KB |
| `ticpin/src/app/admin/ChatSupportPage/page.tsx` | Dashboard Page / Next.js Route | 0.04 KB |
| `ticpin/src/app/admin/ChatSupportPage/reply/page.tsx` | Dashboard Page / Next.js Route | 0.05 KB |
| `ticpin/src/app/admin/UserDetails/userDetails2.tsx` | Dashboard Page / Next.js Route | 11.34 KB |
| `ticpin/src/app/admin/UserDetails/userdetail1.tsx` | Dashboard Page / Next.js Route | 9.95 KB |
| `ticpin/src/app/admin/UserDetails/userdetails2.1.tsx` | Dashboard Page / Next.js Route | 9.67 KB |
| `ticpin/src/app/admin/UserDetails/userdetails2.2.tsx` | Dashboard Page / Next.js Route | 6.33 KB |
| `ticpin/src/app/admin/UserDetails/userdetails3.tsx` | Dashboard Page / Next.js Route | 14.93 KB |
| `ticpin/src/app/admin/UserDetails/userdetails4.tsx` | Dashboard Page / Next.js Route | 5.22 KB |
| `ticpin/src/app/admin/UserDetails/userdetails5.tsx` | Dashboard Page / Next.js Route | 5.65 KB |
| `ticpin/src/app/admin/chat-sessions/page.tsx` | Dashboard Page / Next.js Route | 16.66 KB |
| `ticpin/src/app/admin/dining/page.tsx` | Dashboard Page / Next.js Route | 21.72 KB |
| `ticpin/src/app/admin/events/page.tsx` | Dashboard Page / Next.js Route | 115.15 KB |
| `ticpin/src/app/admin/layout.tsx` | Dashboard Page / Next.js Route | 1.71 KB |
| `ticpin/src/app/admin/login/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/admin/newadminpanel/page.tsx` | Dashboard Page / Next.js Route | 6.16 KB |
| `ticpin/src/app/admin/offers/create/createcoupon.tsx` | Dashboard Page / Next.js Route | 23.54 KB |
| `ticpin/src/app/admin/offers/create/createoffer.tsx` | Dashboard Page / Next.js Route | 21.56 KB |
| `ticpin/src/app/admin/offers/create/page.tsx` | Dashboard Page / Next.js Route | 2.04 KB |
| `ticpin/src/app/admin/offers/createcoupon/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/admin/offers/createoffer/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/admin/offers/layout.tsx` | Dashboard Page / Next.js Route | 3.01 KB |
| `ticpin/src/app/admin/offers/page.tsx` | Dashboard Page / Next.js Route | 0.13 KB |
| `ticpin/src/app/admin/offers/view/page.tsx` | Dashboard Page / Next.js Route | 2.07 KB |
| `ticpin/src/app/admin/offers/view/viewcoupon.tsx` | Dashboard Page / Next.js Route | 18.17 KB |
| `ticpin/src/app/admin/offers/view/viewoffer.tsx` | Dashboard Page / Next.js Route | 14.02 KB |
| `ticpin/src/app/admin/offers/viewcoupon/page.tsx` | Dashboard Page / Next.js Route | 0.27 KB |
| `ticpin/src/app/admin/offers/viewoffer/page.tsx` | Dashboard Page / Next.js Route | 0.26 KB |
| `ticpin/src/app/admin/organizers/[id]/agreement/[category]/page.tsx` | Dashboard Page / Next.js Route | 18.34 KB |
| `ticpin/src/app/admin/organizers/[id]/pan-card/page.tsx` | Dashboard Page / Next.js Route | 17.15 KB |
| `ticpin/src/app/admin/organizers/page.tsx` | Dashboard Page / Next.js Route | 38.43 KB |
| `ticpin/src/app/admin/page.tsx` | Dashboard Page / Next.js Route | 0.64 KB |
| `ticpin/src/app/admin/pass/create/page.tsx` | Dashboard Page / Next.js Route | 8.76 KB |
| `ticpin/src/app/admin/pass/layout.tsx` | Dashboard Page / Next.js Route | 2.77 KB |
| `ticpin/src/app/admin/pass/page.tsx` | Dashboard Page / Next.js Route | 0.12 KB |
| `ticpin/src/app/admin/pass/view/page.tsx` | Dashboard Page / Next.js Route | 17.75 KB |
| `ticpin/src/app/admin/payouts/page.tsx` | Dashboard Page / Next.js Route | 2.75 KB |
| `ticpin/src/app/admin/play/[id]/format/page.tsx` | Dashboard Page / Next.js Route | 42.43 KB |
| `ticpin/src/app/admin/play/page.tsx` | Dashboard Page / Next.js Route | 103.39 KB |
| `ticpin/src/app/admin/push-notification/page.tsx` | Dashboard Page / Next.js Route | 21.29 KB |
| `ticpin/src/app/admin/receipt-verification/page.tsx` | Dashboard Page / Next.js Route | 31.91 KB |
| `ticpin/src/app/admin/user-details-activity/page.tsx` | Dashboard Page / Next.js Route | 0.18 KB |
| `ticpin/src/app/admin/user-details-bookings/page.tsx` | Dashboard Page / Next.js Route | 0.18 KB |
| `ticpin/src/app/admin/user-details-offers/page.tsx` | Dashboard Page / Next.js Route | 0.18 KB |
| `ticpin/src/app/admin/user-details-ticlists/page.tsx` | Dashboard Page / Next.js Route | 0.18 KB |
| `ticpin/src/app/admin/user-details-view-next/page.tsx` | Dashboard Page / Next.js Route | 0.18 KB |
| `ticpin/src/app/admin/user-details-view/page.tsx` | Dashboard Page / Next.js Route | 0.18 KB |
| `ticpin/src/app/admin/user-details/page.tsx` | Dashboard Page / Next.js Route | 0.12 KB |
| `ticpin/src/app/api/chat/groq/route.ts` | Dashboard Page / Next.js Route | 10.80 KB |
| `ticpin/src/app/bookings/[id]/page.tsx` | Dashboard Page / Next.js Route | 153.60 KB |
| `ticpin/src/app/bookings/dining-tickets/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/bookings/dining/[id]/page.tsx` | Dashboard Page / Next.js Route | 13.59 KB |
| `ticpin/src/app/bookings/dining/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/bookings/event-tickets/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/bookings/events/[id]/page.tsx` | Dashboard Page / Next.js Route | 17.91 KB |
| `ticpin/src/app/bookings/events/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/bookings/page.tsx` | Dashboard Page / Next.js Route | 20.55 KB |
| `ticpin/src/app/bookings/play-tickets/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/bookings/play/[id]/page.tsx` | Dashboard Page / Next.js Route | 2.45 KB |
| `ticpin/src/app/bookings/play/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/chat-support/ChatSupportClient.tsx` | Dashboard Page / Next.js Route | 47.57 KB |
| `ticpin/src/app/chat-support/page.tsx` | Dashboard Page / Next.js Route | 1.68 KB |
| `ticpin/src/app/chat-support/session/page.tsx` | Dashboard Page / Next.js Route | 12.54 KB |
| `ticpin/src/app/chat-with-us/page.tsx` | Dashboard Page / Next.js Route | 0.43 KB |
| `ticpin/src/app/contact/ContactClient.tsx` | Dashboard Page / Next.js Route | 6.84 KB |
| `ticpin/src/app/contact/page.tsx` | Dashboard Page / Next.js Route | 0.24 KB |
| `ticpin/src/app/dining/DiningClient.tsx` | Dashboard Page / Next.js Route | 13.49 KB |
| `ticpin/src/app/dining/bar-bites/page.tsx` | Dashboard Page / Next.js Route | 0.30 KB |
| `ticpin/src/app/dining/cafe-vibes/page.tsx` | Dashboard Page / Next.js Route | 0.30 KB |
| `ticpin/src/app/dining/club-chill/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/dining/create/data.ts` | Dashboard Page / Next.js Route | 1.09 KB |
| `ticpin/src/app/dining/create/page.tsx` | Dashboard Page / Next.js Route | 81.97 KB |
| `ticpin/src/app/dining/edit/[id]/page.tsx` | Dashboard Page / Next.js Route | 58.81 KB |
| `ticpin/src/app/dining/family-favourites/page.tsx` | Dashboard Page / Next.js Route | 0.32 KB |
| `ticpin/src/app/dining/layout.tsx` | Dashboard Page / Next.js Route | 0.65 KB |
| `ticpin/src/app/dining/loading.tsx` | Dashboard Page / Next.js Route | 1.59 KB |
| `ticpin/src/app/dining/page.tsx` | Dashboard Page / Next.js Route | 3.63 KB |
| `ticpin/src/app/dining/premium-dining/page.tsx` | Dashboard Page / Next.js Route | 0.33 KB |
| `ticpin/src/app/dining/pure-veg/page.tsx` | Dashboard Page / Next.js Route | 0.30 KB |
| `ticpin/src/app/dining/venue/[name]/DiningVenueDetailClient.tsx` | Dashboard Page / Next.js Route | 16.70 KB |
| `ticpin/src/app/dining/venue/[name]/book/page.tsx` | Dashboard Page / Next.js Route | 29.32 KB |
| `ticpin/src/app/dining/venue/[name]/book/review/page.tsx` | Dashboard Page / Next.js Route | 44.30 KB |
| `ticpin/src/app/dining/venue/[name]/loading.tsx` | Dashboard Page / Next.js Route | 0.98 KB |
| `ticpin/src/app/dining/venue/[name]/page.tsx` | Dashboard Page / Next.js Route | 3.92 KB |
| `ticpin/src/app/error.tsx` | Dashboard Page / Next.js Route | 1.87 KB |
| `ticpin/src/app/events/ArtistsSection.tsx` | Dashboard Page / Next.js Route | 1.35 KB |
| `ticpin/src/app/events/EventCategoryClient.tsx` | Dashboard Page / Next.js Route | 6.31 KB |
| `ticpin/src/app/events/EventsClient.tsx` | Dashboard Page / Next.js Route | 7.69 KB |
| `ticpin/src/app/events/EventsGrid.tsx` | Dashboard Page / Next.js Route | 1.99 KB |
| `ticpin/src/app/events/[name]/EventDetailClient.tsx` | Dashboard Page / Next.js Route | 29.18 KB |
| `ticpin/src/app/events/[name]/book/page.tsx` | Dashboard Page / Next.js Route | 29.30 KB |
| `ticpin/src/app/events/[name]/book/review/BillingDetailsForm.tsx` | Dashboard Page / Next.js Route | 10.88 KB |
| `ticpin/src/app/events/[name]/book/review/OffersCoupons.tsx` | Dashboard Page / Next.js Route | 13.91 KB |
| `ticpin/src/app/events/[name]/book/review/OrderSummary.tsx` | Dashboard Page / Next.js Route | 11.79 KB |
| `ticpin/src/app/events/[name]/book/review/SuccessView.tsx` | Dashboard Page / Next.js Route | 11.08 KB |
| `ticpin/src/app/events/[name]/book/review/page.tsx` | Dashboard Page / Next.js Route | 90.11 KB |
| `ticpin/src/app/events/[name]/book/tickets/[category]/VisualMap.tsx` | Dashboard Page / Next.js Route | 34.06 KB |
| `ticpin/src/app/events/[name]/book/tickets/[category]/page.tsx` | Dashboard Page / Next.js Route | 46.74 KB |
| `ticpin/src/app/events/[name]/loading.tsx` | Dashboard Page / Next.js Route | 1.50 KB |
| `ticpin/src/app/events/[name]/page.tsx` | Dashboard Page / Next.js Route | 3.28 KB |
| `ticpin/src/app/events/artist/[id]/page.tsx` | Dashboard Page / Next.js Route | 7.06 KB |
| `ticpin/src/app/events/comedy/page.tsx` | Dashboard Page / Next.js Route | 1.05 KB |
| `ticpin/src/app/events/create/data.ts` | Dashboard Page / Next.js Route | 17.96 KB |
| `ticpin/src/app/events/create/page.tsx` | Dashboard Page / Next.js Route | 161.60 KB |
| `ticpin/src/app/events/edit/[id]/page.tsx` | Dashboard Page / Next.js Route | 141.24 KB |
| `ticpin/src/app/events/fests-fairs/page.tsx` | Dashboard Page / Next.js Route | 1.10 KB |
| `ticpin/src/app/events/fitness/page.tsx` | Dashboard Page / Next.js Route | 1.06 KB |
| `ticpin/src/app/events/food-drinks/page.tsx` | Dashboard Page / Next.js Route | 1.09 KB |
| `ticpin/src/app/events/layout.tsx` | Dashboard Page / Next.js Route | 0.12 KB |
| `ticpin/src/app/events/loading.tsx` | Dashboard Page / Next.js Route | 1.51 KB |
| `ticpin/src/app/events/music/page.tsx` | Dashboard Page / Next.js Route | 1.07 KB |
| `ticpin/src/app/events/night-life/page.tsx` | Dashboard Page / Next.js Route | 1.08 KB |
| `ticpin/src/app/events/open-mic/page.tsx` | Dashboard Page / Next.js Route | 1.07 KB |
| `ticpin/src/app/events/page.tsx` | Dashboard Page / Next.js Route | 1.75 KB |
| `ticpin/src/app/events/performance/page.tsx` | Dashboard Page / Next.js Route | 1.09 KB |
| `ticpin/src/app/events/screenings/page.tsx` | Dashboard Page / Next.js Route | 1.08 KB |
| `ticpin/src/app/events/sports/page.tsx` | Dashboard Page / Next.js Route | 1.05 KB |
| `ticpin/src/app/layout.tsx` | Dashboard Page / Next.js Route | 3.89 KB |
| `ticpin/src/app/list-your-dining/Login/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/list-your-dining/Signin/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/list-your-dining/list-your-Setups/CreatorSteps.tsx` | Dashboard Page / Next.js Route | 2.48 KB |
| `ticpin/src/app/list-your-dining/list-your-Setups/SetupSidebar.tsx` | Dashboard Page / Next.js Route | 3.74 KB |
| `ticpin/src/app/list-your-dining/otp/page.tsx` | Dashboard Page / Next.js Route | 0.38 KB |
| `ticpin/src/app/list-your-dining/page.tsx` | Dashboard Page / Next.js Route | 4.40 KB |
| `ticpin/src/app/list-your-dining/setup/agreement/page.tsx` | Dashboard Page / Next.js Route | 0.48 KB |
| `ticpin/src/app/list-your-dining/setup/backup/page.tsx` | Dashboard Page / Next.js Route | 0.48 KB |
| `ticpin/src/app/list-your-dining/setup/bank/page.tsx` | Dashboard Page / Next.js Route | 0.48 KB |
| `ticpin/src/app/list-your-dining/setup/gst/page.tsx` | Dashboard Page / Next.js Route | 0.48 KB |
| `ticpin/src/app/list-your-dining/setup/layout.tsx` | Dashboard Page / Next.js Route | 1.04 KB |
| `ticpin/src/app/list-your-dining/setup/page.tsx` | Dashboard Page / Next.js Route | 0.48 KB |
| `ticpin/src/app/list-your-events/Login/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/list-your-events/Signin/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/list-your-events/list-your-Setups/CreatorSteps.tsx` | Dashboard Page / Next.js Route | 2.48 KB |
| `ticpin/src/app/list-your-events/list-your-Setups/SetupSidebar.tsx` | Dashboard Page / Next.js Route | 3.73 KB |
| `ticpin/src/app/list-your-events/otp/page.tsx` | Dashboard Page / Next.js Route | 0.38 KB |
| `ticpin/src/app/list-your-events/page.tsx` | Dashboard Page / Next.js Route | 3.10 KB |
| `ticpin/src/app/list-your-events/setup/agreement/page.tsx` | Dashboard Page / Next.js Route | 7.87 KB |
| `ticpin/src/app/list-your-events/setup/backup/page.tsx` | Dashboard Page / Next.js Route | 16.52 KB |
| `ticpin/src/app/list-your-events/setup/bank/page.tsx` | Dashboard Page / Next.js Route | 12.24 KB |
| `ticpin/src/app/list-your-events/setup/gst/page.tsx` | Dashboard Page / Next.js Route | 16.70 KB |
| `ticpin/src/app/list-your-events/setup/layout.tsx` | Dashboard Page / Next.js Route | 1.04 KB |
| `ticpin/src/app/list-your-events/setup/page.tsx` | Dashboard Page / Next.js Route | 16.68 KB |
| `ticpin/src/app/list-your-play/Login/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/list-your-play/Signin/page.tsx` | Dashboard Page / Next.js Route | 0.31 KB |
| `ticpin/src/app/list-your-play/list-your-Setups/CreatorSteps.tsx` | Dashboard Page / Next.js Route | 3.12 KB |
| `ticpin/src/app/list-your-play/list-your-Setups/SetupSidebar.tsx` | Dashboard Page / Next.js Route | 3.73 KB |
| `ticpin/src/app/list-your-play/otp/page.tsx` | Dashboard Page / Next.js Route | 0.37 KB |
| `ticpin/src/app/list-your-play/page.tsx` | Dashboard Page / Next.js Route | 3.76 KB |
| `ticpin/src/app/list-your-play/setup/agreement/page.tsx` | Dashboard Page / Next.js Route | 7.84 KB |
| `ticpin/src/app/list-your-play/setup/backup/page.tsx` | Dashboard Page / Next.js Route | 16.59 KB |
| `ticpin/src/app/list-your-play/setup/bank/page.tsx` | Dashboard Page / Next.js Route | 12.33 KB |
| `ticpin/src/app/list-your-play/setup/gst/page.tsx` | Dashboard Page / Next.js Route | 16.71 KB |
| `ticpin/src/app/list-your-play/setup/layout.tsx` | Dashboard Page / Next.js Route | 1.03 KB |
| `ticpin/src/app/list-your-play/setup/page.tsx` | Dashboard Page / Next.js Route | 21.80 KB |
| `ticpin/src/app/loading.tsx` | Dashboard Page / Next.js Route | 0.44 KB |
| `ticpin/src/app/login/page.tsx` | Dashboard Page / Next.js Route | 2.75 KB |
| `ticpin/src/app/logout/page.tsx` | Dashboard Page / Next.js Route | 1.28 KB |
| `ticpin/src/app/my-pass/page.tsx` | Dashboard Page / Next.js Route | 3.53 KB |
| `ticpin/src/app/myboooking/[id]/page.tsx` | Dashboard Page / Next.js Route | 27.43 KB |
| `ticpin/src/app/myboooking/page.tsx` | Dashboard Page / Next.js Route | 14.77 KB |
| `ticpin/src/app/not-found.tsx` | Dashboard Page / Next.js Route | 3.40 KB |
| `ticpin/src/app/organizer/dashboard/page.tsx` | Dashboard Page / Next.js Route | 15.70 KB |
| `ticpin/src/app/organizer/overview/page.tsx` | Dashboard Page / Next.js Route | 0.56 KB |
| `ticpin/src/app/organizer/page.tsx` | Dashboard Page / Next.js Route | 0.58 KB |
| `ticpin/src/app/organizer/profile/data.ts` | Dashboard Page / Next.js Route | 13.77 KB |
| `ticpin/src/app/organizer/profile/page.tsx` | Dashboard Page / Next.js Route | 30.37 KB |
| `ticpin/src/app/page.tsx` | Dashboard Page / Next.js Route | 0.96 KB |
| `ticpin/src/app/pass/buy/page.tsx` | Dashboard Page / Next.js Route | 0.46 KB |
| `ticpin/src/app/pass/page.tsx` | Dashboard Page / Next.js Route | 3.62 KB |
| `ticpin/src/app/play/CategoryClient.tsx` | Dashboard Page / Next.js Route | 5.66 KB |
| `ticpin/src/app/play/PlayClient.tsx` | Dashboard Page / Next.js Route | 9.38 KB |
| `ticpin/src/app/play/[name]/PlayDetailClient.tsx` | Dashboard Page / Next.js Route | 27.43 KB |
| `ticpin/src/app/play/[name]/book/page.tsx` | Dashboard Page / Next.js Route | 64.93 KB |
| `ticpin/src/app/play/[name]/book/review/page.tsx` | Dashboard Page / Next.js Route | 97.50 KB |
| `ticpin/src/app/play/[name]/loading.tsx` | Dashboard Page / Next.js Route | 1.54 KB |
| `ticpin/src/app/play/[name]/page.tsx` | Dashboard Page / Next.js Route | 2.80 KB |
| `ticpin/src/app/play/badminton/page.tsx` | Dashboard Page / Next.js Route | 0.96 KB |
| `ticpin/src/app/play/basketball/page.tsx` | Dashboard Page / Next.js Route | 0.97 KB |
| `ticpin/src/app/play/create/data.ts` | Dashboard Page / Next.js Route | 14.12 KB |
| `ticpin/src/app/play/create/format-fixed-corrected.tsx` | Dashboard Page / Next.js Route | 28.66 KB |
| `ticpin/src/app/play/create/format-fixed.tsx` | Dashboard Page / Next.js Route | 0.45 KB |
| `ticpin/src/app/play/create/format/page.tsx` | Dashboard Page / Next.js Route | 51.46 KB |
| `ticpin/src/app/play/create/manage/[id]/page.tsx` | Dashboard Page / Next.js Route | 27.23 KB |
| `ticpin/src/app/play/create/manage/page.tsx` | Dashboard Page / Next.js Route | 23.05 KB |
| `ticpin/src/app/play/create/page.tsx` | Dashboard Page / Next.js Route | 114.64 KB |
| `ticpin/src/app/play/cricket/page.tsx` | Dashboard Page / Next.js Route | 1.15 KB |
| `ticpin/src/app/play/edit/[id]/format/page.tsx` | Dashboard Page / Next.js Route | 61.58 KB |
| `ticpin/src/app/play/edit/[id]/manage/page.tsx` | Dashboard Page / Next.js Route | 24.12 KB |
| `ticpin/src/app/play/edit/[id]/page.tsx` | Dashboard Page / Next.js Route | 107.31 KB |
| `ticpin/src/app/play/football/page.tsx` | Dashboard Page / Next.js Route | 0.96 KB |
| `ticpin/src/app/play/layout.tsx` | Dashboard Page / Next.js Route | 0.11 KB |
| `ticpin/src/app/play/loading.tsx` | Dashboard Page / Next.js Route | 1.84 KB |
| `ticpin/src/app/play/page.tsx` | Dashboard Page / Next.js Route | 1.37 KB |
| `ticpin/src/app/play/pickleball/page.tsx` | Dashboard Page / Next.js Route | 0.97 KB |
| `ticpin/src/app/play/table-tennis/page.tsx` | Dashboard Page / Next.js Route | 0.96 KB |
| `ticpin/src/app/play/tennis/page.tsx` | Dashboard Page / Next.js Route | 0.94 KB |
| `ticpin/src/app/privacy/page.tsx` | Dashboard Page / Next.js Route | 14.03 KB |
| `ticpin/src/app/profile/bookings/dining/page.tsx` | Dashboard Page / Next.js Route | 0.29 KB |
| `ticpin/src/app/profile/bookings/events/page.tsx` | Dashboard Page / Next.js Route | 0.29 KB |
| `ticpin/src/app/profile/bookings/page.tsx` | Dashboard Page / Next.js Route | 0.27 KB |
| `ticpin/src/app/profile/bookings/play/page.tsx` | Dashboard Page / Next.js Route | 0.28 KB |
| `ticpin/src/app/profile/page.tsx` | Dashboard Page / Next.js Route | 20.79 KB |
| `ticpin/src/app/profile/pass/page.tsx` | Dashboard Page / Next.js Route | 11.65 KB |
| `ticpin/src/app/refund/page.tsx` | Dashboard Page / Next.js Route | 11.79 KB |
| `ticpin/src/app/terms/page.tsx` | Dashboard Page / Next.js Route | 18.41 KB |
| `ticpin/src/app/ticket-layout-editor/page.tsx` | Dashboard Page / Next.js Route | 4.11 KB |
| `ticpin/src/app/ticket/[id]/page.tsx` | Dashboard Page / Next.js Route | 9.00 KB |
| `ticpin/src/app/ticlists/page.tsx` | Dashboard Page / Next.js Route | 12.05 KB |
| `ticpin/src/app/ticpass/page.tsx` | Dashboard Page / Next.js Route | 3.62 KB |
| `ticpin/src/app/ticpass/success/page.tsx` | Dashboard Page / Next.js Route | 2.99 KB |
| `ticpin/src/components/Admin Panel/adminpanel.tsx` | Frontend UI Component / Page Tab | 4.99 KB |
| `ticpin/src/components/ErrorBoundary.tsx` | Frontend UI Component / Page Tab | 1.66 KB |
| `ticpin/src/components/EventCard.tsx` | Frontend UI Component / Page Tab | 3.56 KB |
| `ticpin/src/components/FloatingChatWidget.tsx` | Frontend UI Component / Page Tab | 11.20 KB |
| `ticpin/src/components/Mobiledesign/EventCard.tsx` | Frontend UI Component / Page Tab | 3.52 KB |
| `ticpin/src/components/Mobiledesign/MobileBooking.tsx` | Frontend UI Component / Page Tab | 7.77 KB |
| `ticpin/src/components/Mobiledesign/MobileChooseTickets.tsx` | Frontend UI Component / Page Tab | 7.42 KB |
| `ticpin/src/components/Mobiledesign/MobileDiningDetails.tsx` | Frontend UI Component / Page Tab | 13.83 KB |
| `ticpin/src/components/Mobiledesign/MobileEventDetails.tsx` | Frontend UI Component / Page Tab | 13.52 KB |
| `ticpin/src/components/Mobiledesign/MobileEvents.tsx` | Frontend UI Component / Page Tab | 11.75 KB |
| `ticpin/src/components/Mobiledesign/MobileHome.tsx` | Frontend UI Component / Page Tab | 35.69 KB |
| `ticpin/src/components/Mobiledesign/MobilePlay.tsx` | Frontend UI Component / Page Tab | 14.88 KB |
| `ticpin/src/components/Mobiledesign/MobilePlayBooking.tsx` | Frontend UI Component / Page Tab | 8.92 KB |
| `ticpin/src/components/Mobiledesign/MobilePlayDetails.tsx` | Frontend UI Component / Page Tab | 13.06 KB |
| `ticpin/src/components/Mobiledesign/MobilePlayReview.tsx` | Frontend UI Component / Page Tab | 12.54 KB |
| `ticpin/src/components/Mobiledesign/MobileProfile.tsx` | Frontend UI Component / Page Tab | 9.18 KB |
| `ticpin/src/components/Mobiledesign/MobileReviewBooking.tsx` | Frontend UI Component / Page Tab | 12.42 KB |
| `ticpin/src/components/admin/AdminLoginForm.tsx` | Frontend UI Component / Page Tab | 10.48 KB |
| `ticpin/src/components/admin/AdminOrganizersClient.tsx` | Frontend UI Component / Page Tab | 28.06 KB |
| `ticpin/src/components/admin/AdminPayoutsClient.tsx` | Frontend UI Component / Page Tab | 33.30 KB |
| `ticpin/src/components/admin/ChatSessionsClient.tsx` | Frontend UI Component / Page Tab | 18.50 KB |
| `ticpin/src/components/admin/ChatSupportReplyClient.tsx` | Frontend UI Component / Page Tab | 16.66 KB |
| `ticpin/src/components/admin/ImageUpload.tsx` | Frontend UI Component / Page Tab | 3.50 KB |
| `ticpin/src/components/admin/TimeInput.tsx` | Frontend UI Component / Page Tab | 2.12 KB |
| `ticpin/src/components/admin/UserDetailsClient.tsx` | Frontend UI Component / Page Tab | 23.91 KB |
| `ticpin/src/components/booking/DiningBookingExample.tsx` | Frontend UI Component / Page Tab | 6.39 KB |
| `ticpin/src/components/booking/PriceBreakdown.tsx` | Frontend UI Component / Page Tab | 3.87 KB |
| `ticpin/src/components/booking/TicpassDiscount.tsx` | Frontend UI Component / Page Tab | 4.91 KB |
| `ticpin/src/components/bookings/BillDetailsModal.tsx` | Frontend UI Component / Page Tab | 5.82 KB |
| `ticpin/src/components/bookings/BookingDetailsClient.tsx` | Frontend UI Component / Page Tab | 34.84 KB |
| `ticpin/src/components/bookings/BookingsClient.tsx` | Frontend UI Component / Page Tab | 14.43 KB |
| `ticpin/src/components/bookings/CancelModal.tsx` | Frontend UI Component / Page Tab | 16.23 KB |
| `ticpin/src/components/dining/CouponCard.tsx` | Frontend UI Component / Page Tab | 3.97 KB |
| `ticpin/src/components/dining/DiningCategoryClient.tsx` | Frontend UI Component / Page Tab | 6.01 KB |
| `ticpin/src/components/dining/Eventcard.tsx` | Frontend UI Component / Page Tab | 3.39 KB |
| `ticpin/src/components/dining/FilterButton.tsx` | Frontend UI Component / Page Tab | 0.87 KB |
| `ticpin/src/components/dining/venue/BookingCard.tsx` | Frontend UI Component / Page Tab | 3.71 KB |
| `ticpin/src/components/dining/venue/dinnervenue.tsx` | Frontend UI Component / Page Tab | 0.00 KB |
| `ticpin/src/components/events/ArtistAvatar.tsx` | Frontend UI Component / Page Tab | 1.29 KB |
| `ticpin/src/components/events/EventCard.tsx` | Frontend UI Component / Page Tab | 2.85 KB |
| `ticpin/src/components/events/ExploreCard.tsx` | Frontend UI Component / Page Tab | 2.83 KB |
| `ticpin/src/components/events/FilterButton.tsx` | Frontend UI Component / Page Tab | 0.91 KB |
| `ticpin/src/components/events/InteractiveVenueMap.tsx` | Frontend UI Component / Page Tab | 13.01 KB |
| `ticpin/src/components/events/shared/FormSections.tsx` | Frontend UI Component / Page Tab | 11.66 KB |
| `ticpin/src/components/layout/AppBanner.tsx` | Frontend UI Component / Page Tab | 0.78 KB |
| `ticpin/src/components/layout/BottomBanner.tsx` | Frontend UI Component / Page Tab | 1.09 KB |
| `ticpin/src/components/layout/Footer.tsx` | Frontend UI Component / Page Tab | 6.24 KB |
| `ticpin/src/components/layout/LoadingTransition.tsx` | Frontend UI Component / Page Tab | 1.06 KB |
| `ticpin/src/components/layout/Navbar.tsx` | Frontend UI Component / Page Tab | 11.80 KB |
| `ticpin/src/components/layout/Navbar/LocationSelector.tsx` | Frontend UI Component / Page Tab | 1.28 KB |
| `ticpin/src/components/layout/Navbar/ProfileDrawer.tsx` | Frontend UI Component / Page Tab | 34.99 KB |
| `ticpin/src/components/layout/Navbar/SearchInput.tsx` | Frontend UI Component / Page Tab | 10.11 KB |
| `ticpin/src/components/layout/Navbar/UserMenu.tsx` | Frontend UI Component / Page Tab | 4.42 KB |
| `ticpin/src/components/layout/NavbarWrapper.tsx` | Frontend UI Component / Page Tab | 1.37 KB |
| `ticpin/src/components/mobile/Choosetickects.tsx` | Frontend UI Component / Page Tab | 18.31 KB |
| `ticpin/src/components/mobile/EventCard.tsx` | Frontend UI Component / Page Tab | 3.43 KB |
| `ticpin/src/components/mobile/MobileDiningBooking.tsx` | Frontend UI Component / Page Tab | 16.98 KB |
| `ticpin/src/components/mobile/MobileDiningDetails.tsx` | Frontend UI Component / Page Tab | 17.14 KB |
| `ticpin/src/components/mobile/MobileDiningReview.tsx` | Frontend UI Component / Page Tab | 20.01 KB |
| `ticpin/src/components/mobile/MobileEventCard.tsx` | Frontend UI Component / Page Tab | 8.94 KB |
| `ticpin/src/components/mobile/MobileEventDetails.tsx` | Frontend UI Component / Page Tab | 45.71 KB |
| `ticpin/src/components/mobile/MobileEvents.tsx` | Frontend UI Component / Page Tab | 31.82 KB |
| `ticpin/src/components/mobile/MobileHome.tsx` | Frontend UI Component / Page Tab | 74.51 KB |
| `ticpin/src/components/mobile/MobilePlay.tsx` | Frontend UI Component / Page Tab | 29.20 KB |
| `ticpin/src/components/mobile/MobilePlayBooking.tsx` | Frontend UI Component / Page Tab | 15.50 KB |
| `ticpin/src/components/mobile/MobilePlayDetails.tsx` | Frontend UI Component / Page Tab | 17.42 KB |
| `ticpin/src/components/mobile/MobilePlayReview.tsx` | Frontend UI Component / Page Tab | 28.68 KB |
| `ticpin/src/components/mobile/MobileProfile.tsx` | Frontend UI Component / Page Tab | 11.96 KB |
| `ticpin/src/components/mobile/MobileReviewBooking.tsx` | Frontend UI Component / Page Tab | 32.28 KB |
| `ticpin/src/components/mobile/login.tsx` | Frontend UI Component / Page Tab | 23.86 KB |
| `ticpin/src/components/mobile/mybookings-mobile.tsx` | Frontend UI Component / Page Tab | 0.00 KB |
| `ticpin/src/components/modals/AuthModal.tsx` | Frontend UI Component / Page Tab | 22.76 KB |
| `ticpin/src/components/modals/FilterModal.tsx` | Frontend UI Component / Page Tab | 9.82 KB |
| `ticpin/src/components/modals/LocationModal.tsx` | Frontend UI Component / Page Tab | 26.94 KB |
| `ticpin/src/components/modals/MapSelectorModal.tsx` | Frontend UI Component / Page Tab | 11.55 KB |
| `ticpin/src/components/modals/OrganizerLogoutModal.tsx` | Frontend UI Component / Page Tab | 3.79 KB |
| `ticpin/src/components/modals/auth/LoginView.tsx` | Frontend UI Component / Page Tab | 12.03 KB |
| `ticpin/src/components/modals/auth/MenuGrid.tsx` | Frontend UI Component / Page Tab | 3.77 KB |
| `ticpin/src/components/modals/auth/ProfileHeader.tsx` | Frontend UI Component / Page Tab | 0.98 KB |
| `ticpin/src/components/modals/auth/ProfileInfo.tsx` | Frontend UI Component / Page Tab | 5.72 KB |
| `ticpin/src/components/modals/auth/RecentBookings.tsx` | Frontend UI Component / Page Tab | 10.39 KB |
| `ticpin/src/components/modals/auth/TicPassCard.tsx` | Frontend UI Component / Page Tab | 2.32 KB |
| `ticpin/src/components/newadminpanel/newadminpanel.tsx` | Frontend UI Component / Page Tab | 9.87 KB |
| `ticpin/src/components/newadminpanel/panels/AdminDirectory.tsx` | Frontend UI Component / Page Tab | 6.66 KB |
| `ticpin/src/components/newadminpanel/panels/Agreements.tsx` | Frontend UI Component / Page Tab | 3.99 KB |
| `ticpin/src/components/newadminpanel/panels/AssetManager.tsx` | Frontend UI Component / Page Tab | 3.29 KB |
| `ticpin/src/components/newadminpanel/panels/BookingsMaster.tsx` | Frontend UI Component / Page Tab | 5.15 KB |
| `ticpin/src/components/newadminpanel/panels/CacheManagement.tsx` | Frontend UI Component / Page Tab | 4.81 KB |
| `ticpin/src/components/newadminpanel/panels/CredentialLogs.tsx` | Frontend UI Component / Page Tab | 2.63 KB |
| `ticpin/src/components/newadminpanel/panels/DatabaseEditor.tsx` | Frontend UI Component / Page Tab | 9.54 KB |
| `ticpin/src/components/newadminpanel/panels/Dining.tsx` | Frontend UI Component / Page Tab | 21.37 KB |
| `ticpin/src/components/newadminpanel/panels/DiscountCoupons.tsx` | Frontend UI Component / Page Tab | 7.53 KB |
| `ticpin/src/components/newadminpanel/panels/DonationsRefunds.tsx` | Frontend UI Component / Page Tab | 4.06 KB |
| `ticpin/src/components/newadminpanel/panels/DynamicOffers.tsx` | Frontend UI Component / Page Tab | 6.36 KB |
| `ticpin/src/components/newadminpanel/panels/Events.tsx` | Frontend UI Component / Page Tab | 22.05 KB |
| `ticpin/src/components/newadminpanel/panels/GateScanners.tsx` | Frontend UI Component / Page Tab | 4.27 KB |
| `ticpin/src/components/newadminpanel/panels/KYCApprovals.tsx` | Frontend UI Component / Page Tab | 7.53 KB |
| `ticpin/src/components/newadminpanel/panels/OfflineReceipts.tsx` | Frontend UI Component / Page Tab | 4.14 KB |
| `ticpin/src/components/newadminpanel/panels/OrganizerDirectory.tsx` | Frontend UI Component / Page Tab | 8.71 KB |
| `ticpin/src/components/newadminpanel/panels/Overview.tsx` | Frontend UI Component / Page Tab | 6.25 KB |
| `ticpin/src/components/newadminpanel/panels/PayoutSettlements.tsx` | Frontend UI Component / Page Tab | 3.95 KB |
| `ticpin/src/components/newadminpanel/panels/Play.tsx` | Frontend UI Component / Page Tab | 21.63 KB |
| `ticpin/src/components/newadminpanel/panels/PushNotifications.tsx` | Frontend UI Component / Page Tab | 5.58 KB |
| `ticpin/src/components/newadminpanel/panels/RateLimits.tsx` | Frontend UI Component / Page Tab | 4.38 KB |
| `ticpin/src/components/newadminpanel/panels/SalesVelocity.tsx` | Frontend UI Component / Page Tab | 3.04 KB |
| `ticpin/src/components/newadminpanel/panels/SecurityLogs.tsx` | Frontend UI Component / Page Tab | 3.05 KB |
| `ticpin/src/components/newadminpanel/panels/Status.tsx` | Frontend UI Component / Page Tab | 7.43 KB |
| `ticpin/src/components/newadminpanel/panels/SupportTickets.tsx` | Frontend UI Component / Page Tab | 5.30 KB |
| `ticpin/src/components/newadminpanel/panels/TicpassManagement.tsx` | Frontend UI Component / Page Tab | 7.35 KB |
| `ticpin/src/components/newadminpanel/panels/UserDirectory.tsx` | Frontend UI Component / Page Tab | 15.65 KB |
| `ticpin/src/components/newadminpanel/panels/UserPreferences.tsx` | Frontend UI Component / Page Tab | 3.56 KB |
| `ticpin/src/components/organizer/AnalyticsClient.tsx` | Frontend UI Component / Page Tab | 23.35 KB |
| `ticpin/src/components/organizer/DashboardClient.tsx` | Frontend UI Component / Page Tab | 11.39 KB |
| `ticpin/src/components/organizer/ListingCard.tsx` | Frontend UI Component / Page Tab | 6.96 KB |
| `ticpin/src/components/organizer/ListingsGrid.tsx` | Frontend UI Component / Page Tab | 5.03 KB |
| `ticpin/src/components/organizer/OrganizerHeader.tsx` | Frontend UI Component / Page Tab | 6.00 KB |
| `ticpin/src/components/organizer/OrganizerLoginForm.tsx` | Frontend UI Component / Page Tab | 22.22 KB |
| `ticpin/src/components/organizer/OrganizerOTPForm.tsx` | Frontend UI Component / Page Tab | 9.66 KB |
| `ticpin/src/components/organizer/ProfileClient.tsx` | Frontend UI Component / Page Tab | 9.50 KB |
| `ticpin/src/components/organizer/ProfileSidebar.tsx` | Frontend UI Component / Page Tab | 3.86 KB |
| `ticpin/src/components/organizer/Sidebar.tsx` | Frontend UI Component / Page Tab | 4.60 KB |
| `ticpin/src/components/organizer/UserSidebar.tsx` | Frontend UI Component / Page Tab | 5.56 KB |
| `ticpin/src/components/organizer/analytics/InventoryStatus.tsx` | Frontend UI Component / Page Tab | 2.74 KB |
| `ticpin/src/components/organizer/analytics/RevenueByTier.tsx` | Frontend UI Component / Page Tab | 3.89 KB |
| `ticpin/src/components/organizer/analytics/SalesVelocity.tsx` | Frontend UI Component / Page Tab | 2.65 KB |
| `ticpin/src/components/organizer/analytics/TicketKPIs.tsx` | Frontend UI Component / Page Tab | 3.86 KB |
| `ticpin/src/components/organizer/analytics/TicketsOverviewClient.tsx` | Frontend UI Component / Page Tab | 4.32 KB |
| `ticpin/src/components/organizer/overview/AttendeesTab.tsx` | Frontend UI Component / Page Tab | 56.94 KB |
| `ticpin/src/components/organizer/overview/EventDetailsTab.tsx` | Frontend UI Component / Page Tab | 48.66 KB |
| `ticpin/src/components/organizer/overview/FinancialsTab.tsx` | Frontend UI Component / Page Tab | 12.54 KB |
| `ticpin/src/components/organizer/overview/GateControlTab.tsx` | Frontend UI Component / Page Tab | 53.24 KB |
| `ticpin/src/components/organizer/overview/OverviewTab.tsx` | Frontend UI Component / Page Tab | 20.95 KB |
| `ticpin/src/components/organizer/overview/index.tsx` | Frontend UI Component / Page Tab | 23.99 KB |
| `ticpin/src/components/organizer/overview/types.ts` | Frontend UI Component / Page Tab | 0.99 KB |
| `ticpin/src/components/pass/BuyPassClient.tsx` | Frontend UI Component / Page Tab | 21.26 KB |
| `ticpin/src/components/pass/MyPassClient.tsx` | Frontend UI Component / Page Tab | 16.33 KB |
| `ticpin/src/components/play/FilterBar.tsx` | Frontend UI Component / Page Tab | 3.03 KB |
| `ticpin/src/components/play/MapSelector.tsx` | Frontend UI Component / Page Tab | 9.97 KB |
| `ticpin/src/components/play/SportCategoryCard.tsx` | Frontend UI Component / Page Tab | 1.27 KB |
| `ticpin/src/components/play/VenueCard.tsx` | Frontend UI Component / Page Tab | 2.22 KB |
| `ticpin/src/components/profile/EditProfileClient.tsx` | Frontend UI Component / Page Tab | 14.43 KB |
| `ticpin/src/components/providers/Providers.tsx` | Frontend UI Component / Page Tab | 0.66 KB |
| `ticpin/src/components/shared/auth/AuthOTPInput.tsx` | Frontend UI Component / Page Tab | 2.32 KB |
| `ticpin/src/components/shared/auth/AuthPillSwitch.tsx` | Frontend UI Component / Page Tab | 1.13 KB |
| `ticpin/src/components/ticket/PublicTicketClient.tsx` | Frontend UI Component / Page Tab | 8.11 KB |
| `ticpin/src/components/ui/AgreementModal.tsx` | Frontend UI Component / Page Tab | 19.36 KB |
| `ticpin/src/components/ui/AgreementText.ts` | Frontend UI Component / Page Tab | 59.04 KB |
| `ticpin/src/components/ui/SignaturePad.tsx` | Frontend UI Component / Page Tab | 7.69 KB |
| `ticpin/src/components/ui/Skeleton.tsx` | Frontend UI Component / Page Tab | 3.04 KB |
| `ticpin/src/components/ui/Toast.tsx` | Frontend UI Component / Page Tab | 4.46 KB |
| `ticpin/src/components/ui/accordion.tsx` | Frontend UI Component / Page Tab | 2.62 KB |
| `ticpin/src/components/ui/alert-dialog.tsx` | Frontend UI Component / Page Tab | 5.51 KB |
| `ticpin/src/components/ui/alert.tsx` | Frontend UI Component / Page Tab | 2.00 KB |
| `ticpin/src/components/ui/aspect-ratio.tsx` | Frontend UI Component / Page Tab | 0.27 KB |
| `ticpin/src/components/ui/avatar.tsx` | Frontend UI Component / Page Tab | 3.03 KB |
| `ticpin/src/components/ui/badge.tsx` | Frontend UI Component / Page Tab | 1.82 KB |
| `ticpin/src/components/ui/breadcrumb.tsx` | Frontend UI Component / Page Tab | 2.42 KB |
| `ticpin/src/components/ui/button-group.tsx` | Frontend UI Component / Page Tab | 2.30 KB |
| `ticpin/src/components/ui/button.tsx` | Frontend UI Component / Page Tab | 3.26 KB |
| `ticpin/src/components/ui/calendar.tsx` | Frontend UI Component / Page Tab | 8.05 KB |
| `ticpin/src/components/ui/card.tsx` | Frontend UI Component / Page Tab | 2.58 KB |
| `ticpin/src/components/ui/cards/ArtistCard.tsx` | Frontend UI Component / Page Tab | 0.86 KB |
| `ticpin/src/components/ui/cards/CouponCard.tsx` | Frontend UI Component / Page Tab | 3.09 KB |
| `ticpin/src/components/ui/cards/EventCard.tsx` | Frontend UI Component / Page Tab | 8.16 KB |
| `ticpin/src/components/ui/cards/SportCard.tsx` | Frontend UI Component / Page Tab | 1.26 KB |
| `ticpin/src/components/ui/cards/VenueCard.tsx` | Frontend UI Component / Page Tab | 1.41 KB |
| `ticpin/src/components/ui/carousel.tsx` | Frontend UI Component / Page Tab | 5.49 KB |
| `ticpin/src/components/ui/chart.tsx` | Frontend UI Component / Page Tab | 10.25 KB |
| `ticpin/src/components/ui/checkbox.tsx` | Frontend UI Component / Page Tab | 1.37 KB |
| `ticpin/src/components/ui/collapsible.tsx` | Frontend UI Component / Page Tab | 0.78 KB |
| `ticpin/src/components/ui/combobox.tsx` | Frontend UI Component / Page Tab | 8.86 KB |
| `ticpin/src/components/ui/command.tsx` | Frontend UI Component / Page Tab | 4.84 KB |
| `ticpin/src/components/ui/context-menu.tsx` | Frontend UI Component / Page Tab | 8.11 KB |
| `ticpin/src/components/ui/dialog.tsx` | Frontend UI Component / Page Tab | 4.13 KB |
| `ticpin/src/components/ui/direction.tsx` | Frontend UI Component / Page Tab | 0.49 KB |
| `ticpin/src/components/ui/drawer.tsx` | Frontend UI Component / Page Tab | 4.28 KB |
| `ticpin/src/components/ui/dropdown-menu.tsx` | Frontend UI Component / Page Tab | 8.62 KB |
| `ticpin/src/components/ui/empty.tsx` | Frontend UI Component / Page Tab | 2.34 KB |
| `ticpin/src/components/ui/field.tsx` | Frontend UI Component / Page Tab | 5.88 KB |
| `ticpin/src/components/ui/hover-card.tsx` | Frontend UI Component / Page Tab | 1.48 KB |
| `ticpin/src/components/ui/input-group.tsx` | Frontend UI Component / Page Tab | 5.08 KB |
| `ticpin/src/components/ui/input-otp.tsx` | Frontend UI Component / Page Tab | 2.49 KB |
| `ticpin/src/components/ui/input.tsx` | Frontend UI Component / Page Tab | 0.95 KB |
| `ticpin/src/components/ui/item.tsx` | Frontend UI Component / Page Tab | 4.67 KB |
| `ticpin/src/components/ui/kbd.tsx` | Frontend UI Component / Page Tab | 0.82 KB |
| `ticpin/src/components/ui/label.tsx` | Frontend UI Component / Page Tab | 0.59 KB |
| `ticpin/src/components/ui/menubar.tsx` | Frontend UI Component / Page Tab | 8.25 KB |
| `ticpin/src/components/ui/native-select.tsx` | Frontend UI Component / Page Tab | 2.04 KB |
| `ticpin/src/components/ui/navigation-menu.tsx` | Frontend UI Component / Page Tab | 6.37 KB |
| `ticpin/src/components/ui/pagination.tsx` | Frontend UI Component / Page Tab | 2.76 KB |
| `ticpin/src/components/ui/popover.tsx` | Frontend UI Component / Page Tab | 2.32 KB |
| `ticpin/src/components/ui/progress.tsx` | Frontend UI Component / Page Tab | 0.73 KB |
| `ticpin/src/components/ui/radio-group.tsx` | Frontend UI Component / Page Tab | 1.65 KB |
| `ticpin/src/components/ui/resizable.tsx` | Frontend UI Component / Page Tab | 1.63 KB |
| `ticpin/src/components/ui/scroll-area.tsx` | Frontend UI Component / Page Tab | 1.65 KB |
| `ticpin/src/components/ui/select.tsx` | Frontend UI Component / Page Tab | 6.52 KB |
| `ticpin/src/components/ui/separator.tsx` | Frontend UI Component / Page Tab | 0.63 KB |
| `ticpin/src/components/ui/sheet.tsx` | Frontend UI Component / Page Tab | 4.46 KB |
| `ticpin/src/components/ui/sidebar.tsx` | Frontend UI Component / Page Tab | 20.73 KB |
| `ticpin/src/components/ui/skeleton.tsx` | Frontend UI Component / Page Tab | 0.27 KB |
| `ticpin/src/components/ui/slider.tsx` | Frontend UI Component / Page Tab | 1.81 KB |
| `ticpin/src/components/ui/sonner.tsx` | Frontend UI Component / Page Tab | 1.20 KB |
| `ticpin/src/components/ui/spinner.tsx` | Frontend UI Component / Page Tab | 0.29 KB |
| `ticpin/src/components/ui/switch.tsx` | Frontend UI Component / Page Tab | 1.71 KB |
| `ticpin/src/components/ui/table.tsx` | Frontend UI Component / Page Tab | 2.35 KB |
| `ticpin/src/components/ui/tabs.tsx` | Frontend UI Component / Page Tab | 3.49 KB |
| `ticpin/src/components/ui/textarea.tsx` | Frontend UI Component / Page Tab | 0.82 KB |
| `ticpin/src/components/ui/toggle-group.tsx` | Frontend UI Component / Page Tab | 3.12 KB |
| `ticpin/src/components/ui/toggle.tsx` | Frontend UI Component / Page Tab | 1.77 KB |
| `ticpin/src/components/ui/tooltip.tsx` | Frontend UI Component / Page Tab | 2.06 KB |
| `ticpin/src/data/constants.ts` | Source file | 0.79 KB |
| `ticpin/src/data/mockData.ts` | Source file | 2.86 KB |
| `ticpin/src/data/sports.ts` | Source file | 0.48 KB |
| `ticpin/src/data/venues.ts` | Source file | 1.82 KB |
| `ticpin/src/hooks/use-mobile.ts` | Custom React hook | 0.55 KB |
| `ticpin/src/hooks/useDebounce.ts` | Custom React hook | 0.57 KB |
| `ticpin/src/hooks/useIsMounted.ts` | Custom React hook | 0.71 KB |
| `ticpin/src/hooks/useSlotLock.ts` | Custom React hook | 7.15 KB |
| `ticpin/src/hooks/useStore.ts` | Custom React hook | 1.01 KB |
| `ticpin/src/hooks/useUserPass.ts` | Custom React hook | 2.15 KB |
| `ticpin/src/layout-editor/components/ui/accordion.tsx` | Source file | 1.97 KB |
| `ticpin/src/layout-editor/components/ui/alert-dialog.tsx` | Source file | 4.08 KB |
| `ticpin/src/layout-editor/components/ui/alert.tsx` | Source file | 1.55 KB |
| `ticpin/src/layout-editor/components/ui/aspect-ratio.tsx` | Source file | 0.14 KB |
| `ticpin/src/layout-editor/components/ui/avatar.tsx` | Source file | 1.38 KB |
| `ticpin/src/layout-editor/components/ui/badge.tsx` | Source file | 1.10 KB |
| `ticpin/src/layout-editor/components/ui/breadcrumb.tsx` | Source file | 2.68 KB |
| `ticpin/src/layout-editor/components/ui/button.tsx` | Source file | 1.85 KB |
| `ticpin/src/layout-editor/components/ui/calendar.tsx` | Source file | 7.04 KB |
| `ticpin/src/layout-editor/components/ui/card.tsx` | Source file | 1.77 KB |
| `ticpin/src/layout-editor/components/ui/carousel.tsx` | Source file | 6.05 KB |
| `ticpin/src/layout-editor/components/ui/chart.tsx` | Source file | 10.32 KB |
| `ticpin/src/layout-editor/components/ui/checkbox.tsx` | Source file | 1.02 KB |
| `ticpin/src/layout-editor/components/ui/collapsible.tsx` | Source file | 0.33 KB |
| `ticpin/src/layout-editor/components/ui/command.tsx` | Source file | 4.76 KB |
| `ticpin/src/layout-editor/components/ui/context-menu.tsx` | Source file | 7.22 KB |
| `ticpin/src/layout-editor/components/ui/dialog.tsx` | Source file | 3.56 KB |
| `ticpin/src/layout-editor/components/ui/drawer.tsx` | Source file | 2.90 KB |
| `ticpin/src/layout-editor/components/ui/dropdown-menu.tsx` | Source file | 7.42 KB |
| `ticpin/src/layout-editor/components/ui/form.tsx` | Source file | 4.10 KB |
| `ticpin/src/layout-editor/components/ui/hover-card.tsx` | Source file | 1.22 KB |
| `ticpin/src/layout-editor/components/ui/input-otp.tsx` | Source file | 2.11 KB |
| `ticpin/src/layout-editor/components/ui/input.tsx` | Source file | 0.76 KB |
| `ticpin/src/layout-editor/components/ui/label.tsx` | Source file | 0.70 KB |
| `ticpin/src/layout-editor/components/ui/menubar.tsx` | Source file | 8.35 KB |
| `ticpin/src/layout-editor/components/ui/navigation-menu.tsx` | Source file | 5.03 KB |
| `ticpin/src/layout-editor/components/ui/pagination.tsx` | Source file | 2.67 KB |
| `ticpin/src/layout-editor/components/ui/popover.tsx` | Source file | 1.32 KB |
| `ticpin/src/layout-editor/components/ui/progress.tsx` | Source file | 0.76 KB |
| `ticpin/src/layout-editor/components/ui/radio-group.tsx` | Source file | 1.37 KB |
| `ticpin/src/layout-editor/components/ui/resizable.tsx` | Source file | 1.52 KB |
| `ticpin/src/layout-editor/components/ui/scroll-area.tsx` | Source file | 1.60 KB |
| `ticpin/src/layout-editor/components/ui/select.tsx` | Source file | 5.61 KB |
| `ticpin/src/layout-editor/components/ui/separator.tsx` | Source file | 0.71 KB |
| `ticpin/src/layout-editor/components/ui/sheet.tsx` | Source file | 4.15 KB |
| `ticpin/src/layout-editor/components/ui/sidebar.tsx` | Source file | 23.41 KB |
| `ticpin/src/layout-editor/components/ui/skeleton.tsx` | Source file | 0.23 KB |
| `ticpin/src/layout-editor/components/ui/slider.tsx` | Source file | 1.00 KB |
| `ticpin/src/layout-editor/components/ui/sonner.tsx` | Source file | 0.72 KB |
| `ticpin/src/layout-editor/components/ui/switch.tsx` | Source file | 1.13 KB |
| `ticpin/src/layout-editor/components/ui/table.tsx` | Source file | 2.75 KB |
| `ticpin/src/layout-editor/components/ui/tabs.tsx` | Source file | 1.89 KB |
| `ticpin/src/layout-editor/components/ui/textarea.tsx` | Source file | 0.66 KB |
| `ticpin/src/layout-editor/components/ui/toggle-group.tsx` | Source file | 1.71 KB |
| `ticpin/src/layout-editor/components/ui/toggle.tsx` | Source file | 1.50 KB |
| `ticpin/src/layout-editor/components/ui/tooltip.tsx` | Source file | 1.25 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/Canvas.tsx` | Source file | 11.99 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/CanvasElement.tsx` | Source file | 15.96 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/ColorPickerField.tsx` | Source file | 2.94 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/ContextMenu.tsx` | Source file | 2.14 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/GridLayer.tsx` | Source file | 0.64 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/IconPickerModal.tsx` | Source file | 1.08 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/ImageUploader.tsx` | Source file | 0.84 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/LayersPanel.tsx` | Source file | 3.70 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/LayoutBuilder.tsx` | Source file | 3.90 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/LeftSidebar.tsx` | Source file | 4.15 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/PreviewModal.tsx` | Source file | 6.32 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/PropertyField.tsx` | Source file | 0.43 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/RightSidebar.tsx` | Source file | 20.23 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/SectionCard.tsx` | Source file | 2.85 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/ShapeToolbar.tsx` | Source file | 0.21 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/Toolbar.tsx` | Source file | 4.42 KB |
| `ticpin/src/layout-editor/features/layout-builder/components/Transformer.tsx` | Source file | 1.66 KB |
| `ticpin/src/layout-editor/features/layout-builder/functions/listLayouts.ts` | Source file | 0.82 KB |
| `ticpin/src/layout-editor/features/layout-builder/functions/loadLayout.ts` | Source file | 0.86 KB |
| `ticpin/src/layout-editor/features/layout-builder/functions/saveLayout.ts` | Source file | 1.36 KB |
| `ticpin/src/layout-editor/features/layout-builder/hooks/useCanvasExport.ts` | Source file | 1.69 KB |
| `ticpin/src/layout-editor/features/layout-builder/hooks/useCanvasHistory.ts` | Source file | 0.44 KB |
| `ticpin/src/layout-editor/features/layout-builder/hooks/useKeyboardShortcuts.ts` | Source file | 2.02 KB |
| `ticpin/src/layout-editor/features/layout-builder/hooks/useMultiSelect.ts` | Source file | 0.24 KB |
| `ticpin/src/layout-editor/features/layout-builder/hooks/useSnapToGrid.ts` | Source file | 0.23 KB |
| `ticpin/src/layout-editor/features/layout-builder/lib/canvasUtils.ts` | Source file | 0.83 KB |
| `ticpin/src/layout-editor/features/layout-builder/lib/colorPresets.ts` | Source file | 5.44 KB |
| `ticpin/src/layout-editor/features/layout-builder/lib/elementDefaults.ts` | Source file | 4.77 KB |
| `ticpin/src/layout-editor/features/layout-builder/lib/iconMap.ts` | Source file | 0.50 KB |
| `ticpin/src/layout-editor/features/layout-builder/lib/layoutSerializer.ts` | Source file | 7.90 KB |
| `ticpin/src/layout-editor/features/layout-builder/store/layoutStore.ts` | Source file | 10.79 KB |
| `ticpin/src/layout-editor/features/layout-builder/types/layout.types.ts` | Source file | 2.42 KB |
| `ticpin/src/layout-editor/hooks/use-mobile.tsx` | Source file | 0.56 KB |
| `ticpin/src/layout-editor/integrations/supabase/auth-attacher.ts` | Source file | 0.60 KB |
| `ticpin/src/layout-editor/integrations/supabase/auth-middleware.ts` | Source file | 2.22 KB |
| `ticpin/src/layout-editor/integrations/supabase/client.server.ts` | Source file | 1.69 KB |
| `ticpin/src/layout-editor/integrations/supabase/client.ts` | Source file | 1.54 KB |
| `ticpin/src/layout-editor/integrations/supabase/types.ts` | Source file | 5.78 KB |
| `ticpin/src/layout-editor/lib/api/example.functions.ts` | Source file | 0.88 KB |
| `ticpin/src/layout-editor/lib/config.server.ts` | Source file | 1.09 KB |
| `ticpin/src/layout-editor/lib/error-capture.ts` | Source file | 0.88 KB |
| `ticpin/src/layout-editor/lib/error-page.ts` | Source file | 1.34 KB |
| `ticpin/src/layout-editor/lib/lovable-error-reporting.ts` | Source file | 0.81 KB |
| `ticpin/src/layout-editor/lib/utils.ts` | Source file | 0.17 KB |
| `ticpin/src/layout-editor/routeTree.gen.ts` | Source file | 4.86 KB |
| `ticpin/src/layout-editor/router.tsx` | Source file | 0.38 KB |
| `ticpin/src/layout-editor/routes/__root.tsx` | Source file | 4.71 KB |
| `ticpin/src/layout-editor/routes/_authenticated/layout-builder.tsx` | Source file | 0.44 KB |
| `ticpin/src/layout-editor/routes/_authenticated/route.tsx` | Source file | 0.42 KB |
| `ticpin/src/layout-editor/routes/auth.tsx` | Source file | 3.82 KB |
| `ticpin/src/layout-editor/routes/index.tsx` | Source file | 1.43 KB |
| `ticpin/src/layout-editor/routes/layout-preview.tsx` | Source file | 5.43 KB |
| `ticpin/src/layout-editor/server.ts` | Source file | 1.80 KB |
| `ticpin/src/layout-editor/start.ts` | Source file | 0.72 KB |
| `ticpin/src/lib/api.ts` | Utility function / helper module | 5.27 KB |
| `ticpin/src/lib/api/admin.ts` | Utility function / helper module | 26.80 KB |
| `ticpin/src/lib/api/auth.ts` | Utility function / helper module | 2.63 KB |
| `ticpin/src/lib/api/booking.ts` | Utility function / helper module | 12.73 KB |
| `ticpin/src/lib/api/dining.ts` | Utility function / helper module | 3.35 KB |
| `ticpin/src/lib/api/events.ts` | Utility function / helper module | 2.74 KB |
| `ticpin/src/lib/api/organizer.ts` | Utility function / helper module | 6.62 KB |
| `ticpin/src/lib/api/pass.ts` | Utility function / helper module | 4.41 KB |
| `ticpin/src/lib/api/play.ts` | Utility function / helper module | 2.89 KB |
| `ticpin/src/lib/api/profile.ts` | Utility function / helper module | 2.59 KB |
| `ticpin/src/lib/auth/admin.ts` | Utility function / helper module | 0.74 KB |
| `ticpin/src/lib/auth/clearAll.ts` | Utility function / helper module | 1.80 KB |
| `ticpin/src/lib/auth/organizer.ts` | Utility function / helper module | 6.27 KB |
| `ticpin/src/lib/auth/user.ts` | Utility function / helper module | 3.25 KB |
| `ticpin/src/lib/bookingFlow.ts` | Utility function / helper module | 2.19 KB |
| `ticpin/src/lib/cache.ts` | Utility function / helper module | 2.05 KB |
| `ticpin/src/lib/cloudinary.ts` | Utility function / helper module | 1.26 KB |
| `ticpin/src/lib/firebase.ts` | Utility function / helper module | 1.06 KB |
| `ticpin/src/lib/hooks/useBookings.ts` | Utility function / helper module | 0.91 KB |
| `ticpin/src/lib/hooks/useGeolocation.ts` | Utility function / helper module | 2.33 KB |
| `ticpin/src/lib/hooks/useProfile.ts` | Utility function / helper module | 1.47 KB |
| `ticpin/src/lib/hooks/useSessionSync.ts` | Utility function / helper module | 0.63 KB |
| `ticpin/src/lib/imageResize.ts` | Utility function / helper module | 4.66 KB |
| `ticpin/src/lib/mediaValidation.ts` | Utility function / helper module | 2.20 KB |
| `ticpin/src/lib/storage.ts` | Utility function / helper module | 2.47 KB |
| `ticpin/src/lib/useLocation.ts` | Utility function / helper module | 1.61 KB |
| `ticpin/src/lib/utils.ts` | Utility function / helper module | 3.42 KB |
| `ticpin/src/lib/utils/booking-status.ts` | Utility function / helper module | 1.86 KB |
| `ticpin/src/lib/utils/otp-state.ts` | Utility function / helper module | 1.04 KB |
| `ticpin/src/proxy.ts` | Source file | 11.20 KB |
| `ticpin/src/store/playCreateStore.ts` | State management store (Zustand/Redux) | 5.62 KB |
| `ticpin/src/store/useCreateEventStore.ts` | State management store (Zustand/Redux) | 3.70 KB |
| `ticpin/src/store/useCreatePlayStore.ts` | State management store (Zustand/Redux) | 6.79 KB |
| `ticpin/src/store/useEventStore.ts` | State management store (Zustand/Redux) | 2.02 KB |
| `ticpin/src/store/useIdentityStore.ts` | State management store (Zustand/Redux) | 6.56 KB |
| `ticpin/src/store/useLocationStore.ts` | State management store (Zustand/Redux) | 4.81 KB |
| `ticpin/src/store/useReservationStore.ts` | State management store (Zustand/Redux) | 2.39 KB |
| `ticpin/update_play_create.js` | Source file | 7.17 KB |
| `ticpin/wrangler.jsonc` | Source file | 0.63 KB |
