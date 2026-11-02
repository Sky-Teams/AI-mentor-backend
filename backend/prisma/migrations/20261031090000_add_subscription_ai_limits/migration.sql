-- Replace OPENAI with the supported plan providers, mapping existing rows to GROQ.
CREATE TYPE "AiProvider_new" AS ENUM ('GROQ', 'OPENROUTER');

ALTER TABLE "ReviewRun" ALTER COLUMN "aiProvider" DROP DEFAULT;
ALTER TABLE "AiUsageLog" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "ParaphraseRun" ALTER COLUMN "aiProvider" DROP DEFAULT;

ALTER TABLE "ReviewRun"
    ALTER COLUMN "aiProvider" TYPE "AiProvider_new"
    USING (CASE WHEN "aiProvider"::text = 'OPENAI' THEN 'GROQ' ELSE "aiProvider"::text END)::"AiProvider_new";
ALTER TABLE "AiUsageLog"
    ALTER COLUMN "provider" TYPE "AiProvider_new"
    USING (CASE WHEN "provider"::text = 'OPENAI' THEN 'GROQ' ELSE "provider"::text END)::"AiProvider_new";
ALTER TABLE "ParaphraseRun"
    ALTER COLUMN "aiProvider" TYPE "AiProvider_new"
    USING (CASE WHEN "aiProvider"::text = 'OPENAI' THEN 'GROQ' ELSE "aiProvider"::text END)::"AiProvider_new";

DROP TYPE "AiProvider";
ALTER TYPE "AiProvider_new" RENAME TO "AiProvider";

CREATE TYPE "LimitPeriod" AS ENUM ('WEEKLY', 'MONTHLY');

ALTER TABLE "SubscriptionPlan"
    ADD COLUMN "aiProvider" "AiProvider" NOT NULL DEFAULT 'GROQ',
    ADD COLUMN "aiModel" TEXT NOT NULL DEFAULT 'openai/gpt-oss-120b',
    ADD COLUMN "tokenLimit" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "limitPeriod" "LimitPeriod" NOT NULL DEFAULT 'MONTHLY';

ALTER TABLE "SubscriptionPlan"
    ALTER COLUMN "name" SET NOT NULL;

CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

ALTER TABLE "ReviewRun" ALTER COLUMN "aiProvider" SET DEFAULT 'GROQ';
ALTER TABLE "AiUsageLog" ALTER COLUMN "provider" SET DEFAULT 'GROQ';
ALTER TABLE "ParaphraseRun" ALTER COLUMN "aiProvider" SET DEFAULT 'GROQ';
