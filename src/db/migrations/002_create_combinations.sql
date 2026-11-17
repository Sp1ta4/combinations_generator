CREATE TABLE IF NOT EXISTS combinations (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  combination_hash BINARY(32)   NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_combinations_hash (combination_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;