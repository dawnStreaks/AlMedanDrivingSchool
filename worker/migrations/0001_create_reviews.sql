CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT NOT NULL,
    submitter_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_submitter_created_at ON reviews (submitter_hash, created_at DESC);

INSERT INTO reviews (name, rating, review, submitter_hash, created_at) VALUES
    ('Al Medan student', 5, 'Mr. Ali gave me a clear idea of everything I needed to know and was always ready to repeat the lesson.', 'initial-seed', 1),
    ('Al Medan student', 5, 'The training was calm and practical. I recommend Al Medan to anyone starting their driving journey.', 'initial-seed', 2),
    ('Al Medan student', 5, 'Good lessons, flexible timing and helpful guidance for the signal and driving test.', 'initial-seed', 3);
