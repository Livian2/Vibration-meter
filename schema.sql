CREATE TABLE IF NOT EXISTS accelerometer_data (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL,
  flush_index INTEGER NOT NULL,
  csv_data    TEXT    NOT NULL,
  count       INTEGER NOT NULL,
  created_at  TEXT    DEFAULT (datetime('now'))
);
