CREATE TABLE IF NOT EXISTS responses (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  combination_id INT UNSIGNED NOT NULL,
  response       JSON         NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_responses_combination FOREIGN KEY (combination_id)
    REFERENCES combinations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;