CREATE DATABASE IF NOT EXISTS dic2iabd_db;
USE dic2iabd_db;

CREATE TABLE IF NOT EXISTS detections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_scan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    objects_found TEXT NOT NULL,
    analysis_summary TEXT
);