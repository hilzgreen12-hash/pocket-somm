-- New profile rows now default to NULL (Baller) instead of 100. The app
-- treats NULL as Baller throughout, so this matches the UI default and
-- means users who breeze through onboarding without touching the slider
-- land on Baller rather than "Up to £100". Existing rows are left alone
-- (users who have a value set keep their preference).

alter table profiles
  alter column default_budget drop default;
