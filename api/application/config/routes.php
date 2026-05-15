<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| Default Route
|--------------------------------------------------------------------------
*/
$route['default_controller'] = 'api/businesses';
$route['404_override'] = '';
$route['translate_uri_dashes'] = TRUE;

/*
|--------------------------------------------------------------------------
| Cities
|--------------------------------------------------------------------------
*/
$route['api/cities']['GET']                    = 'api/cities/index';
$route['api/cities/(:any)']['GET']             = 'api/cities/show/$1';

/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/
$route['api/categories']['GET']                = 'api/categories/index';
$route['api/categories/(:any)']['GET']         = 'api/categories/show/$1';

/*
|--------------------------------------------------------------------------
| Localities
|--------------------------------------------------------------------------
*/
$route['api/localities/(:any)']['GET']         = 'api/localities/by_city/$1';

/*
|--------------------------------------------------------------------------
| Businesses
|--------------------------------------------------------------------------
*/
$route['api/businesses']['GET']                = 'api/businesses/index';
$route['api/businesses/(:any)/reviews']['GET'] = 'api/reviews/by_business/$1';
$route['api/businesses/(:any)/reviews']['POST']= 'api/reviews/create/$1';
$route['api/businesses/(:any)']['GET']         = 'api/businesses/show/$1';

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/
$route['api/search']['GET']                    = 'api/search/index';
$route['api/platform/config']['GET']           = 'api/platform_config/index';

/*
|--------------------------------------------------------------------------
| Elasticsearch
|--------------------------------------------------------------------------
*/
$route['api/elastic/ping']['GET']                  = 'api/elastic/ping';
$route['api/admin/elastic/setup']['POST']          = 'api/elastic/setup';
$route['api/admin/elastic/reindex']['POST']        = 'api/elastic/reindex';
$route['api/admin/elastic/reindex/(:num)']['POST'] = 'api/elastic/reindex_one/$1';

/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
*/
$route['api/seo/meta']['GET']                  = 'api/seo/meta';
$route['api/seo/breadcrumbs']['GET']           = 'api/seo/breadcrumbs';
$route['api/seo/static-params/(:any)']['GET']  = 'api/seo/static_params/$1';

/*
|--------------------------------------------------------------------------
| Sitemap
|--------------------------------------------------------------------------
*/
$route['api/sitemap/urls']['GET']              = 'api/sitemap/urls';
$route['api/sitemap/xml']['GET']               = 'api/sitemap/xml';

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/
$route['api/auth/login']['POST']               = 'api/auth/login';
$route['api/auth/register']['POST']            = 'api/auth/register';
$route['api/auth/logout']['POST']              = 'api/auth/logout';
$route['api/auth/profile']['GET']              = 'api/auth/profile';
$route['api/auth/phone-login']['POST']         = 'api/auth/phone_login';
$route['api/auth/complete-profile']['POST']    = 'api/auth/complete_profile';
$route['api/auth/google-login']['POST']        = 'api/auth/google_login';
$route['api/vendor/register']['POST']                      = 'api/vendor_onboarding/register_vendor';
$route['api/vendor/onboarding/status']['GET']              = 'api/vendor_onboarding/onboarding_status';
$route['api/vendor/onboarding/complete']['POST']           = 'api/vendor_onboarding/complete_onboarding';
$route['api/vendor/onboarding/business-profile']['POST']   = 'api/vendor_onboarding/save_business_profile';
$route['api/vendor/onboarding/services']['POST']           = 'api/vendor_onboarding/save_services';
$route['api/vendor/onboarding/kyc-documents']['POST']      = 'api/vendor_onboarding/save_kyc_documents';
$route['api/vendor/onboarding/bank-details']['POST']       = 'api/vendor_onboarding/save_bank_details_onboarding';

/*
|--------------------------------------------------------------------------
| Dashboard (authenticated business owner)
|--------------------------------------------------------------------------
*/
$route['api/dashboard/business']['GET']        = 'api/dashboard/my_business';
$route['api/dashboard/business']['PUT']        = 'api/dashboard/update_business';
$route['api/dashboard/business/images']['POST']= 'api/dashboard/upload_image';
$route['api/dashboard/business/images/(:num)']['DELETE'] = 'api/dashboard/delete_image/$1';
$route['api/dashboard/reviews']['GET']         = 'api/dashboard/my_reviews';
$route['api/dashboard/stats']['GET']           = 'api/dashboard/stats';

/*
|--------------------------------------------------------------------------
| Admin (admin role required)
|--------------------------------------------------------------------------
*/
$route['api/admin/businesses']['GET']              = 'api/admin/businesses';
$route['api/admin/businesses/backfill-states']['POST'] = 'api/admin/backfill_business_states';
$route['api/admin/businesses/(:num)']['GET']       = 'api/admin/business_detail/$1';
$route['api/admin/businesses']['POST']             = 'api/admin/create_business';
$route['api/admin/businesses/(:num)']['PUT']       = 'api/admin/update_business/$1';
$route['api/admin/businesses/(:num)']['DELETE']    = 'api/admin/delete_business/$1';
$route['api/admin/businesses/(:num)/approve']['POST']  = 'api/admin/approve_business/$1';
$route['api/admin/businesses/(:num)/verify']['POST']   = 'api/admin/verify_business/$1';
$route['api/admin/businesses/(:num)/feature']['POST']  = 'api/admin/feature_business/$1';

$route['api/admin/categories']['GET']              = 'api/admin/categories';
$route['api/admin/categories']['POST']             = 'api/admin/create_category';
$route['api/admin/categories/(:num)']['PUT']       = 'api/admin/update_category/$1';
$route['api/admin/categories/(:num)']['DELETE']    = 'api/admin/delete_category/$1';

$route['api/admin/cities']['GET']                  = 'api/admin/cities';
$route['api/admin/cities']['POST']                 = 'api/admin/create_city';
$route['api/admin/cities/(:num)']['PUT']           = 'api/admin/update_city/$1';
$route['api/admin/localities']['GET']              = 'api/admin/localities';
$route['api/admin/localities']['POST']             = 'api/admin/create_locality';
$route['api/admin/localities/(:num)']['PUT']       = 'api/admin/update_locality/$1';
$route['api/admin/localities/(:num)']['DELETE']    = 'api/admin/delete_locality/$1';

$route['api/admin/reviews']['GET']                 = 'api/admin/reviews';
$route['api/admin/reviews/(:num)/approve']['POST'] = 'api/admin/approve_review/$1';
$route['api/admin/reviews/(:num)']['DELETE']       = 'api/admin/delete_review/$1';

$route['api/admin/users']['GET']                   = 'api/admin/users';
$route['api/admin/users']['POST']                  = 'api/admin/create_user';
$route['api/admin/users/(:num)']['PUT']            = 'api/admin/update_user/$1';

$route['api/admin/claims']['GET']                  = 'api/admin/claims';
$route['api/admin/claims/(:num)']['PUT']           = 'api/admin/update_claim/$1';

$route['api/admin/seo']['GET']                     = 'api/admin/seo_list';
$route['api/admin/seo']['POST']                    = 'api/admin/save_seo';
$route['api/admin/seo/(:num)']['DELETE']           = 'api/admin/delete_seo/$1';

$route['api/admin/settings']['GET']                = 'api/admin/settings';
$route['api/admin/settings']['POST']               = 'api/admin/save_settings';

$route['api/admin/stats']['GET']                   = 'api/admin/dashboard_stats';
$route['api/admin/stats']['OPTIONS']               = 'api/admin/dashboard_stats';

/*
|--------------------------------------------------------------------------
| Services (public)
|--------------------------------------------------------------------------
*/
$route['api/services']['GET']                          = 'api/services/index';
$route['api/services/(:num)']['GET']                   = 'api/services/show/$1';
$route['api/businesses/(:any)/services']['GET']        = 'api/services/by_business/$1';

/*
|--------------------------------------------------------------------------
| Addresses (authenticated customer)
|--------------------------------------------------------------------------
*/
$route['api/addresses']['GET']                         = 'api/addresses/index';
$route['api/addresses']['POST']                        = 'api/addresses/create';
$route['api/addresses/(:num)']['PUT']                  = 'api/addresses/update/$1';
$route['api/addresses/(:num)']['DELETE']               = 'api/addresses/delete/$1';

/*
|--------------------------------------------------------------------------
| Bookings (authenticated customer)
|--------------------------------------------------------------------------
*/
$route['api/bookings']['GET']                          = 'api/bookings/my_bookings';
$route['api/bookings']['POST']                         = 'api/bookings/create';
$route['api/bookings/(:num)']['GET']                   = 'api/bookings/show/$1';
$route['api/bookings/(:num)/cancel']['POST']           = 'api/bookings/cancel/$1';

/*
|--------------------------------------------------------------------------
| Payments (Razorpay)
|--------------------------------------------------------------------------
*/
$route['api/payments/create-order']['POST']            = 'api/payments/create_order';
$route['api/payments/verify']['POST']                  = 'api/payments/verify';
$route['api/payments/webhook']['POST']                 = 'api/payments/webhook';

/*
|--------------------------------------------------------------------------
| Notifications (authenticated)
|--------------------------------------------------------------------------
*/
$route['api/notifications']['GET']                     = 'api/notifications/index';
$route['api/notifications/unread-count']['GET']        = 'api/notifications/unread_count';
$route['api/notifications/(:num)/read']['POST']        = 'api/notifications/mark_read/$1';
$route['api/notifications/read-all']['POST']           = 'api/notifications/mark_all_read';

/*
|--------------------------------------------------------------------------
| OTP
|--------------------------------------------------------------------------
*/
$route['api/otp/send']['POST']                         = 'api/otp/send';
$route['api/otp/verify']['POST']                       = 'api/otp/verify';

/*
|--------------------------------------------------------------------------
| Vendor Dashboard (vendor/business_owner role)
|--------------------------------------------------------------------------
*/
$route['api/vendor/stats']['GET']                      = 'api/vendor_dashboard/stats';
$route['api/vendor/bookings']['GET']                   = 'api/vendor_dashboard/pending_bookings';
$route['api/vendor/bookings/(:num)/accept']['POST']    = 'api/vendor_dashboard/accept/$1';
$route['api/vendor/bookings/(:num)/reject']['POST']    = 'api/vendor_dashboard/reject/$1';
$route['api/vendor/bookings/(:num)/start']['POST']     = 'api/vendor_dashboard/start/$1';
$route['api/vendor/bookings/(:num)/complete']['POST']  = 'api/vendor_dashboard/complete/$1';
$route['api/vendor/bookings/(:num)/collect-payment']['POST'] = 'api/vendor_dashboard/collect_payment/$1';
$route['api/vendor/services']['GET']                   = 'api/vendor_dashboard/my_services';
$route['api/vendor/services']['POST']                  = 'api/vendor_dashboard/create_service';
$route['api/vendor/services/(:num)']['PUT']            = 'api/vendor_dashboard/update_service/$1';
$route['api/vendor/services/(:num)']['DELETE']         = 'api/vendor_dashboard/delete_service/$1';
$route['api/vendor/availability']['GET']               = 'api/vendor_dashboard/availability';
$route['api/vendor/availability']['PUT']               = 'api/vendor_dashboard/update_availability';
$route['api/vendor/service-areas']['GET']              = 'api/vendor_dashboard/service_areas';
$route['api/vendor/service-areas']['POST']             = 'api/vendor_dashboard/update_service_areas';
$route['api/vendor/categories']['GET']                 = 'api/vendor_dashboard/my_categories';
$route['api/vendor/categories']['POST']                = 'api/vendor_dashboard/update_categories';

/*
|--------------------------------------------------------------------------
| Admin: Bookings & Commissions
|--------------------------------------------------------------------------
*/
$route['api/admin/bookings']['GET']                    = 'api/admin/bookings';
$route['api/admin/bookings/(:num)']['GET']             = 'api/admin/booking_detail/$1';
$route['api/admin/bookings/(:num)/status']['PUT']      = 'api/admin/update_booking_status/$1';
$route['api/admin/commissions']['GET']                 = 'api/admin/commission_rules';
$route['api/admin/commissions']['POST']                = 'api/admin/save_commission_rule';
$route['api/admin/commissions/(:num)']['PUT']          = 'api/admin/update_commission_rule/$1';
$route['api/admin/commissions/(:num)']['DELETE']       = 'api/admin/delete_commission_rule/$1';
$route['api/admin/services']['GET']                    = 'api/admin/all_services';

/*
|--------------------------------------------------------------------------
| Vendor: Subscriptions, Onboarding, Bank, Documents
|--------------------------------------------------------------------------
*/
$route['api/vendor/subscriptions/plans']['GET']        = 'api/subscriptions/plans';
$route['api/vendor/subscriptions/current']['GET']      = 'api/subscriptions/current';
$route['api/vendor/subscriptions/subscribe']['POST']   = 'api/subscriptions/subscribe';
$route['api/vendor/subscriptions/cancel']['POST']      = 'api/subscriptions/cancel';
$route['api/vendor/documents']['POST']                 = 'api/vendor_onboarding/upload_document';
$route['api/vendor/documents']['GET']                  = 'api/vendor_onboarding/my_documents';
$route['api/vendor/bank-details']['GET']               = 'api/vendor_onboarding/bank_details';
$route['api/vendor/bank-details']['POST']              = 'api/vendor_onboarding/save_bank_details';
$route['api/vendor/payouts']['GET']                    = 'api/vendor_onboarding/payouts';
$route['api/vendor/reviews']['GET']                    = 'api/booking_reviews/vendor_reviews';
$route['api/vendor/reviews/(:num)/reply']['POST']      = 'api/booking_reviews/reply/$1';

/*
|--------------------------------------------------------------------------
| Chat
|--------------------------------------------------------------------------
*/
$route['api/chat/conversations']['GET']                = 'api/chat/my_conversations';
$route['api/chat/(:num)']['GET']                       = 'api/chat/messages/$1';
$route['api/chat/(:num)']['POST']                      = 'api/chat/send/$1';

/*
|--------------------------------------------------------------------------
| Booking Reviews & Coupons
|--------------------------------------------------------------------------
*/
$route['api/bookings/(:num)/review']['POST']           = 'api/booking_reviews/submit/$1';
$route['api/coupons/validate']['POST']                 = 'api/coupons/validate_coupon';

/*
|--------------------------------------------------------------------------
| Admin: Subscriptions, Payouts, KYC, Coupons, Analytics
|--------------------------------------------------------------------------
*/
$route['api/admin/subscription-plans']['GET']          = 'api/admin/subscription_plans';
$route['api/admin/subscription-plans']['POST']         = 'api/admin/create_subscription_plan';
$route['api/admin/subscription-plans/(:num)']['PUT']   = 'api/admin/update_subscription_plan/$1';
$route['api/admin/vendor-subscriptions']['GET']        = 'api/admin/vendor_subscriptions';
$route['api/admin/payouts']['GET']                     = 'api/admin/payouts';
$route['api/admin/payouts/(:num)/process']['POST']     = 'api/admin/process_payout/$1';
$route['api/admin/vendor-documents']['GET']            = 'api/admin/vendor_documents';
$route['api/admin/vendor-documents/(:num)/approve']['POST'] = 'api/admin/approve_vendor_document/$1';
$route['api/admin/vendor-documents/(:num)/reject']['POST']  = 'api/admin/reject_vendor_document/$1';
$route['api/admin/coupons']['GET']                     = 'api/admin/coupons';
$route['api/admin/coupons']['POST']                    = 'api/admin/create_coupon';
$route['api/admin/coupons/(:num)']['PUT']              = 'api/admin/update_coupon/$1';
$route['api/admin/coupons/(:num)']['DELETE']           = 'api/admin/delete_coupon/$1';
$route['api/admin/analytics/revenue']['GET']           = 'api/admin/analytics_revenue';
$route['api/admin/analytics/bookings']['GET']          = 'api/admin/analytics_bookings';
$route['api/admin/analytics/vendors']['GET']           = 'api/admin/analytics_vendors';
$route['api/admin/login-logs']['GET']                  = 'api/admin/login_logs';
$route['api/admin/otp-logs']['GET']                    = 'api/admin/otp_logs';
$route['api/admin/leads']['GET']                       = 'api/admin/all_leads';
$route['api/leads']['POST']                            = 'api/leads/create';
$route['api/vendor/leads']['GET']                      = 'api/leads/vendor_leads';
