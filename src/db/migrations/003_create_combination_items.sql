CREATE TABLE IF NOT EXISTS combination_items (
  combination_id INT UNSIGNED     NOT NULL,
  group_index    INT UNSIGNED     NOT NULL,
  position       TINYINT UNSIGNED NOT NULL,
  item_id        INT UNSIGNED     NOT NULL,
  PRIMARY KEY (combination_id, group_index, position),
  CONSTRAINT fk_ci_combination FOREIGN KEY (combination_id)
    REFERENCES combinations (id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_item FOREIGN KEY (item_id)
    REFERENCES items (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;