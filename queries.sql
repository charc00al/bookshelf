CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('read', 'want-to-read', 'reading')) NOT NULL,
  date_added TIMESTAMP DEFAULT now(),
  cover_url TEXT,
  isbn TEXT,
  year_finished INT,
  rating INT CHECK (rating BETWEEN 1 AND 10),
  notes TEXT,
  why TEXT,
  series TEXT
);