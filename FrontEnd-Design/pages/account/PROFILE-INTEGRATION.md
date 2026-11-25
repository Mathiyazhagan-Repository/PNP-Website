# My Profile

Reference layout: existing dashboard sidebar, active red My Profile tab, avatar and civic line art, personal details form. Dashboard My Profile and Edit Profile now open profile.html. No Back to Dashboard button.

Section5.16 requires mobile OTP; profile, membership ID, donations/receipts, recurring management, grievance tickets, saved preferences; withdrawable consent and deletion request. This change implements the requested Profile screen only.

PNPAccount same-origin endpoints: sessionEndpoint GET returns {authenticated:true,user:{display_name,email,district_id,preferred_language,masked_mobile,mobile_verified}}; profileEndpoint PATCH accepts editable profile fields and returns {saved:true}; logoutEndpoint POST returns {logged_out:true}. State changes require csrf-token meta content, secure server session and backend authorisation. No local authentication or stored personal fixtures. Photo chooser provides a temporary local preview, not a saved upload. Identity/mobile changes require approved server re-verification. District options reuse geography-data.js. Unavailable service, expired session, forbidden, network and save-error states remain honest.

The other account sections remain outside this change. Syntax and structural checks performed; browser screenshot comparison not performed.

## My Membership and navbar
Membership page follows Profile sidebar and reference red/gold ID layout. No Back to Dashboard CTA. Existing localhost OTP preview sets a sessionStorage presentation flag only; no private APIs trust it. Preview card is explicitly illustrative, with official downloads/QR disabled. Production membershipEndpoint returns {authenticated:true,membership:{name,member_id,status,member_since,valid_until,photo_url,qr_image_url,card_url,share_url}}; authorised issued assets are required. No new member IDs or official receipts are generated. Print opens the issued official card for printing.
account-nav.js is installed through shared-layout.js. A confirmed sessionEndpoint response enables account icon at end of desktop navbar and mobile account link, hiding Login/Sign Up. Localhost preview uses the presentation flag; production cannot. Account link opens profile.html and sidebar connects My Membership. Logout clears the local presentation flag. Source syntax, unique IDs and local assets checked.
