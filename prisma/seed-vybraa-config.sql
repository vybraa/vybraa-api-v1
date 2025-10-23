-- Vybraa Config Settings Seeder
-- Insert default configuration settings for the platform

INSERT INTO vybraa_config_settings (id, name, description, slug, value, "calculationType", "createdAt", "updatedAt") VALUES
-- Request fee configuration
('config_001', 'Request Fee Charge', 'Platform fee charged on each request', 'request_fee_charge', '10', 'PERCENTAGE', NOW(), NOW()),

-- Price limits
('config_002', 'Minimum Request Price', 'Minimum price allowed for requests', 'minimum_request_price', '5000', 'FIXED', NOW(), NOW()),
('config_003', 'Maximum Request Price', 'Maximum price allowed for requests', 'maximum_request_price', '500000', 'FIXED', NOW(), NOW()),

-- Withdrawal fee
('config_004', 'Withdrawal Fee', 'Fee charged for wallet withdrawals', 'withdrawal_fee', '100', 'FIXED', NOW(), NOW())

-- Handle duplicate key conflicts by doing nothing
ON CONFLICT (slug) DO NOTHING;
