-- Email verification is introduced in this release. Accounts created before
-- it were never asked to verify their address; mark them as verified so that
-- enabling REQUIRE_EMAIL_VERIFICATION (or SMTP with the "auto" default) does
-- not lock existing users out. Accounts created afterwards are unaffected.
UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" = false;
