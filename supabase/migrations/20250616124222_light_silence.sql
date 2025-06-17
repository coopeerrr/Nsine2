/*
  # Medical Equipment E-commerce Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `stock` (integer)
      - `category_id` (uuid, foreign key)
      - `images` (text array)
      - `specifications` (jsonb)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_id` (uuid)
      - `customer_email` (text)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `products` (jsonb)
      - `total_amount` (decimal)
      - `status` (text)
      - `shipping_address` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to products and categories
    - Add policies for authenticated admin access to orders and messages
    - Add policies for order creation by anyone
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  products jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Orders policies (admin access, customer creation)
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Messages policies (public create, admin read)
CREATE POLICY "Anyone can create messages"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
  ('Diagnostic Equipment', 'Advanced diagnostic tools and imaging equipment', 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg'),
  ('Surgical Instruments', 'Precision surgical tools and equipment', 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg'),
  ('Patient Monitoring', 'Vital signs and patient monitoring systems', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg'),
  ('Laboratory Equipment', 'Lab analysis and testing equipment', 'https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg'),
  ('Rehabilitation', 'Physical therapy and rehabilitation equipment', 'https://images.pexels.com/photos/4386463/pexels-photo-4386463.jpeg'),
  ('Emergency Care', 'Emergency and critical care equipment', 'https://images.pexels.com/photos/4386462/pexels-photo-4386462.jpeg');

-- Insert sample products
DO $$
DECLARE
  cat_diagnostic uuid;
  cat_surgical uuid;
  cat_monitoring uuid;
  cat_lab uuid;
  cat_rehab uuid;
  cat_emergency uuid;
BEGIN
  SELECT id INTO cat_diagnostic FROM categories WHERE name = 'Diagnostic Equipment';
  SELECT id INTO cat_surgical FROM categories WHERE name = 'Surgical Instruments';
  SELECT id INTO cat_monitoring FROM categories WHERE name = 'Patient Monitoring';
  SELECT id INTO cat_lab FROM categories WHERE name = 'Laboratory Equipment';
  SELECT id INTO cat_rehab FROM categories WHERE name = 'Rehabilitation';
  SELECT id INTO cat_emergency FROM categories WHERE name = 'Emergency Care';

  INSERT INTO products (name, description, price, stock, category_id, images, specifications, is_featured) VALUES
    ('Digital X-Ray System', 'High-resolution digital radiography system with advanced imaging capabilities', 45000.00, 5, cat_diagnostic, ARRAY['https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg'], '{"resolution": "4096x4096", "exposure_time": "0.1-10s", "warranty": "3 years"}', true),
    ('Ultrasound Scanner Pro', 'Portable ultrasound system with color Doppler and 3D imaging', 28000.00, 8, cat_diagnostic, ARRAY['https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg'], '{"frequency": "2-15 MHz", "display": "15 inch LCD", "battery": "4 hours"}', true),
    ('Surgical Microscope', 'High-precision surgical microscope with LED illumination', 65000.00, 3, cat_surgical, ARRAY['https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg'], '{"magnification": "6x-40x", "illumination": "LED", "working_distance": "200-400mm"}', true),
    ('Patient Monitor Elite', '15-parameter patient monitoring system with wireless connectivity', 12000.00, 15, cat_monitoring, ARRAY['https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg'], '{"parameters": "ECG, SpO2, NIBP, Temp", "display": "15 inch touchscreen", "battery": "8 hours"}', true),
    ('Centrifuge System', 'High-speed laboratory centrifuge with digital controls', 8500.00, 12, cat_lab, ARRAY['https://images.pexels.com/photos/4386463/pexels-photo-4386463.jpeg'], '{"max_speed": "15000 RPM", "capacity": "24 tubes", "timer": "1-99 minutes"}', false),
    ('Defibrillator AED', 'Automated external defibrillator with voice prompts', 3500.00, 25, cat_emergency, ARRAY['https://images.pexels.com/photos/4386462/pexels-photo-4386462.jpeg'], '{"energy": "1-200J", "battery": "5 years", "voice_prompts": "Yes"}', true),
    ('Rehabilitation Bike', 'Upper and lower body rehabilitation exercise bike', 4200.00, 10, cat_rehab, ARRAY['https://images.pexels.com/photos/4386461/pexels-photo-4386461.jpeg'], '{"resistance": "Variable", "display": "LCD", "programs": "12 preset"}', false),
    ('Sterilization Unit', 'Steam sterilizer with automatic cycle control', 15000.00, 6, cat_surgical, ARRAY['https://images.pexels.com/photos/4386460/pexels-photo-4386460.jpeg'], '{"chamber_size": "18L", "temperature": "121-134C", "cycle_time": "15-60 minutes"}', false);
END $$;