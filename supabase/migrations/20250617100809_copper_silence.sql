/*
  # Complete Database Rebuild with User Management

  1. Drop existing tables and recreate with proper structure
  2. Set up user management with admin roles
  3. Create comprehensive RLS policies
  4. Insert sample data with proper relationships
  5. Create admin user and sample products

  ## Tables Created:
  - categories: Product categories with images
  - products: Complete product information
  - orders: Customer orders with full details
  - messages: Customer contact messages
  - user_profiles: Extended user information with roles

  ## Security:
  - Row Level Security enabled on all tables
  - Admin-only access for management operations
  - Public read access for products and categories
  - Secure user role management
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table for role management
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table with enhanced structure
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(12,2) NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table with comprehensive structure
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  products jsonb NOT NULL DEFAULT '[]',
  total_amount decimal(12,2) NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table for customer inquiries
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add policy for inserting new profiles
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products Policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can read all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders Policies
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Messages Policies
CREATE POLICY "Anyone can create messages"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
  ('Diagnostic Equipment', 'Advanced diagnostic tools and imaging equipment for accurate medical diagnosis', 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg'),
  ('Surgical Instruments', 'Precision surgical tools and equipment for various medical procedures', 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg'),
  ('Patient Monitoring', 'Vital signs and patient monitoring systems for continuous care', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg'),
  ('Laboratory Equipment', 'Lab analysis and testing equipment for medical research and diagnosis', 'https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg'),
  ('Rehabilitation', 'Physical therapy and rehabilitation equipment for patient recovery', 'https://images.pexels.com/photos/4386463/pexels-photo-4386463.jpeg'),
  ('Emergency Care', 'Emergency and critical care equipment for life-saving interventions', 'https://images.pexels.com/photos/4386462/pexels-photo-4386462.jpeg');

-- Insert sample products with proper category relationships
DO $$
DECLARE
  cat_diagnostic uuid;
  cat_surgical uuid;
  cat_monitoring uuid;
  cat_lab uuid;
  cat_rehab uuid;
  cat_emergency uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_diagnostic FROM categories WHERE name = 'Diagnostic Equipment';
  SELECT id INTO cat_surgical FROM categories WHERE name = 'Surgical Instruments';
  SELECT id INTO cat_monitoring FROM categories WHERE name = 'Patient Monitoring';
  SELECT id INTO cat_lab FROM categories WHERE name = 'Laboratory Equipment';
  SELECT id INTO cat_rehab FROM categories WHERE name = 'Rehabilitation';
  SELECT id INTO cat_emergency FROM categories WHERE name = 'Emergency Care';

  -- Insert sample products
  INSERT INTO products (name, description, price, stock, category_id, images, specifications, is_featured, is_active) VALUES
    (
      'Digital X-Ray System DX-5000',
      'State-of-the-art digital radiography system with high-resolution imaging capabilities, advanced image processing, and DICOM compatibility. Perfect for hospitals and diagnostic centers.',
      45000.00, 
      5, 
      cat_diagnostic, 
      ARRAY['https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg'], 
      '{"resolution": "4096x4096 pixels", "exposure_time": "0.1-10 seconds", "detector_size": "17x17 inches", "warranty": "3 years", "power": "220V/50Hz", "weight": "850 kg"}',
      true,
      true
    ),
    (
      'Ultrasound Scanner Pro US-3000',
      'Portable ultrasound system with color Doppler, 3D/4D imaging, and advanced cardiac analysis. Ideal for obstetrics, cardiology, and general imaging.',
      28000.00, 
      8, 
      cat_diagnostic, 
      ARRAY['https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg'], 
      '{"frequency": "2-15 MHz", "display": "15 inch LCD touchscreen", "battery": "4 hours continuous", "probes": "Linear, Convex, Cardiac", "storage": "500GB SSD"}',
      true,
      true
    ),
    (
      'Surgical Microscope SM-2000',
      'High-precision surgical microscope with LED illumination, motorized zoom, and integrated camera system. Essential for neurosurgery and ophthalmology.',
      65000.00, 
      3, 
      cat_surgical, 
      ARRAY['https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg'], 
      '{"magnification": "6x-40x", "illumination": "LED 50000 hours", "working_distance": "200-400mm", "camera": "4K integrated", "motorized": "Yes"}',
      true,
      true
    ),
    (
      'Patient Monitor Elite PM-1500',
      '15-parameter patient monitoring system with wireless connectivity, alarm management, and central station integration.',
      12000.00, 
      15, 
      cat_monitoring, 
      ARRAY['https://images.pexels.com/photos/4386463/pexels-photo-4386463.jpeg'], 
      '{"parameters": "ECG, SpO2, NIBP, Temperature, Respiration", "display": "15 inch color touchscreen", "battery": "8 hours", "connectivity": "WiFi, Bluetooth", "alarms": "Visual and audio"}',
      true,
      true
    ),
    (
      'Laboratory Centrifuge LC-4000',
      'High-speed laboratory centrifuge with digital controls, multiple rotor options, and safety features for various lab applications.',
      8500.00, 
      12, 
      cat_lab, 
      ARRAY['https://images.pexels.com/photos/4386462/pexels-photo-4386462.jpeg'], 
      '{"max_speed": "15000 RPM", "capacity": "24 tubes x 15ml", "timer": "1-99 minutes", "temperature": "Refrigerated 4°C", "safety": "Imbalance detection"}',
      false,
      true
    ),
    (
      'Automated Defibrillator AED-500',
      'Automated external defibrillator with voice prompts, CPR coaching, and pediatric capability. Essential for emergency response.',
      3500.00, 
      25, 
      cat_emergency, 
      ARRAY['https://images.pexels.com/photos/4386461/pexels-photo-4386461.jpeg'], 
      '{"energy": "1-200 Joules", "battery": "5 years standby", "voice_prompts": "Multi-language", "pediatric": "Yes", "weight": "2.2 kg"}',
      true,
      true
    ),
    (
      'Rehabilitation Exercise Bike RB-300',
      'Upper and lower body rehabilitation exercise bike with adjustable resistance and progress tracking.',
      4200.00, 
      10, 
      cat_rehab, 
      ARRAY['https://images.pexels.com/photos/4386460/pexels-photo-4386460.jpeg'], 
      '{"resistance": "Variable magnetic", "display": "LCD with programs", "programs": "12 preset rehabilitation", "weight_capacity": "150 kg", "dimensions": "120x60x140 cm"}',
      false,
      true
    ),
    (
      'Steam Sterilizer SS-200',
      'Automatic steam sterilizer with multiple cycle options, printer, and validation features for surgical instruments.',
      15000.00, 
      6, 
      cat_surgical, 
      ARRAY['https://images.pexels.com/photos/4386459/pexels-photo-4386459.jpeg'], 
      '{"chamber_size": "18 liters", "temperature": "121-134°C", "cycle_time": "15-60 minutes", "printer": "Built-in", "validation": "Biological indicators"}',
      false,
      true
    ),
    (
      'MRI Scanner 1.5T',
      'High-field MRI scanner with advanced imaging sequences and patient comfort features.',
      850000.00, 
      1, 
      cat_diagnostic, 
      ARRAY['https://images.pexels.com/photos/4386458/pexels-photo-4386458.jpeg'], 
      '{"field_strength": "1.5 Tesla", "bore_diameter": "70 cm", "sequences": "T1, T2, FLAIR, DWI", "gradient": "33 mT/m", "installation": "Professional required"}',
      true,
      true
    ),
    (
      'Ventilator ICU-Pro',
      'Advanced ICU ventilator with multiple ventilation modes and monitoring capabilities.',
      35000.00, 
      4, 
      cat_emergency, 
      ARRAY['https://images.pexels.com/photos/4386457/pexels-photo-4386457.jpeg'], 
      '{"modes": "Volume, Pressure, SIMV, CPAP", "tidal_volume": "50-2000 ml", "pressure": "5-100 cmH2O", "monitoring": "Real-time graphics", "battery": "4 hours backup"}',
      true,
      true
    );
END $$;

-- Insert sample messages
INSERT INTO messages (name, email, subject, message, is_read) VALUES
  ('Dr. Sarah Johnson', 'sarah.johnson@hospital.com', 'Inquiry about X-Ray System', 'Hello, I am interested in the Digital X-Ray System DX-5000. Could you please provide more information about installation requirements and training?', false),
  ('Mark Thompson', 'mark.t@clinic.com', 'Ultrasound Scanner Quote', 'We are looking to purchase 2 units of the Ultrasound Scanner Pro. Can you provide a bulk discount quote?', true),
  ('Lisa Chen', 'lisa.chen@medcenter.org', 'Technical Support Request', 'We are experiencing issues with our Patient Monitor Elite. The display is flickering intermittently.', false),
  ('Dr. Robert Wilson', 'r.wilson@surgery.com', 'Surgical Microscope Demo', 'We would like to schedule a demonstration of the Surgical Microscope SM-2000 at our facility.', true);

-- Insert sample orders
INSERT INTO orders (customer_email, customer_name, customer_phone, products, total_amount, status, shipping_address) VALUES
  (
    'admin@hospital.com',
    'City General Hospital',
    '+1-555-0123',
    '[{"id": "1", "name": "Digital X-Ray System DX-5000", "price": 45000, "quantity": 1}]',
    45000.00,
    'processing',
    '{"street": "123 Medical Center Dr", "city": "Healthcare City", "state": "HC", "zip": "12345", "country": "USA"}'
  ),
  (
    'purchasing@clinic.com',
    'Metro Medical Clinic',
    '+1-555-0456',
    '[{"id": "2", "name": "Ultrasound Scanner Pro US-3000", "price": 28000, "quantity": 2}]',
    56000.00,
    'shipped',
    '{"street": "456 Health Ave", "city": "Medical Town", "state": "MT", "zip": "67890", "country": "USA"}'
  );

-- Create admin user function (to be called after user signup)
CREATE OR REPLACE FUNCTION create_admin_user(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET role = 'admin' 
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;