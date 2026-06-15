-- First-Click Fight schema (Cloudflare D1 / SQLite)
-- Coordinates are stored as percentages (0..100) of the product screen.

CREATE TABLE IF NOT EXISTS screens (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  kind          TEXT NOT NULL,            -- landing | onboarding | pricing
  width         INTEGER NOT NULL,
  height        INTEGER NOT NULL,
  eyebrow       TEXT NOT NULL,
  headline      TEXT NOT NULL,
  subcopy       TEXT NOT NULL,
  targets_json  TEXT NOT NULL,            -- JSON array of {id,label,x,y,w,h,kind}
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fights (
  id                  TEXT PRIMARY KEY,
  screen_id           TEXT NOT NULL,
  intended_target_id  TEXT NOT NULL,
  owner_session_id    TEXT NOT NULL,
  owner_key_hash      TEXT NOT NULL,      -- sha256(ownerKey); ownerKey = hmac(secret, fightId)
  status              TEXT NOT NULL DEFAULT 'live',  -- live | scored | rematch_shipped
  rematch_choice      TEXT,               -- challenger_promoted | intended_defended
  challenger_target_id TEXT,
  created_at          INTEGER NOT NULL,
  shipped_at          INTEGER,
  FOREIGN KEY (screen_id) REFERENCES screens(id)
);

CREATE TABLE IF NOT EXISTS clicks (
  id                 TEXT PRIMARY KEY,
  fight_id           TEXT NOT NULL,
  visitor_session_id TEXT NOT NULL,
  nx                 REAL NOT NULL,       -- 0..100
  ny                 REAL NOT NULL,       -- 0..100
  matched_target_id  TEXT,                -- null = clicked empty space
  is_official        INTEGER NOT NULL DEFAULT 0,
  src                TEXT NOT NULL DEFAULT 'desktop', -- desktop | qr
  created_at         INTEGER NOT NULL,
  FOREIGN KEY (fight_id) REFERENCES fights(id)
);

CREATE TABLE IF NOT EXISTS cards (
  slug               TEXT PRIMARY KEY,
  fight_id           TEXT NOT NULL,
  click_id           TEXT NOT NULL,
  result             TEXT NOT NULL,       -- CTA_DEFENDED | CTA_KNOCKED_OUT
  intended_target_id TEXT NOT NULL,
  actual_target_id   TEXT,
  created_at         INTEGER NOT NULL,
  FOREIGN KEY (fight_id) REFERENCES fights(id)
);

CREATE TABLE IF NOT EXISTS usage_events (
  id          TEXT PRIMARY KEY,
  fight_id    TEXT,
  card_slug   TEXT,
  session_id  TEXT NOT NULL,
  event_name  TEXT NOT NULL,             -- fcf_fight_created | fcf_first_action_clicked | fcf_result_inspected | fcf_card_replayed | fcf_rematch_shipped | fcf_rematch_returned
  payload     TEXT,                      -- JSON
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clicks_fight ON clicks(fight_id);
CREATE INDEX IF NOT EXISTS idx_clicks_fight_session ON clicks(fight_id, visitor_session_id, is_official);
CREATE INDEX IF NOT EXISTS idx_cards_fight ON cards(fight_id);
CREATE INDEX IF NOT EXISTS idx_usage_fight ON usage_events(fight_id);
CREATE INDEX IF NOT EXISTS idx_usage_event_name ON usage_events(event_name);
CREATE INDEX IF NOT EXISTS idx_fights_owner ON fights(owner_session_id);
