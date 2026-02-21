-- Add read column to messages table for tracking read status
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.messages.read IS 'Whether the message has been read by the recipient';
