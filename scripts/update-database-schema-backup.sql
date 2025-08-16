-- Database Schema Update for EventStorageManager
-- Adds backup and archive fields to events table

-- Add backup and archive columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS backup_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_drive_backup_url TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_is_archived ON events(is_archived);
CREATE INDEX IF NOT EXISTS idx_events_archived_at ON events(archived_at);
CREATE INDEX IF NOT EXISTS idx_events_backup_id ON events(backup_id);

-- Update existing events to have default values
UPDATE events 
SET is_archived = FALSE 
WHERE is_archived IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN events.is_archived IS 'Whether the event has been archived after backup';
COMMENT ON COLUMN events.archived_at IS 'Timestamp when the event was archived';
COMMENT ON COLUMN events.backup_id IS 'ID of the backup operation for this event';
COMMENT ON COLUMN events.google_drive_backup_url IS 'Google Drive folder URL for the event backup';

-- Create a view for backup statistics
CREATE OR REPLACE VIEW backup_statistics AS
SELECT 
    COUNT(*) as total_events,
    COUNT(CASE WHEN is_archived = TRUE THEN 1 END) as archived_events,
    COUNT(CASE WHEN backup_id IS NOT NULL THEN 1 END) as backed_up_events,
    COUNT(CASE WHEN google_drive_backup_url IS NOT NULL THEN 1 END) as events_with_drive_backup,
    ROUND(
        (COUNT(CASE WHEN is_archived = TRUE THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) as archive_percentage
FROM events;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, UPDATE ON events TO your_app_user;
-- GRANT SELECT ON backup_statistics TO your_app_user;