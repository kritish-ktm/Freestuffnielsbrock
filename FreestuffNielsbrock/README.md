Freestuff Niels Brock 🎓
A student marketplace platform for Niels Brock Copenhagen Business College students to buy, sell, and trade items within the campus community.
🌟 Features

User Authentication - Secure login and registration with Supabase
Item Listings - Post items for sale or give away for free
User Profiles - View profiles of sellers and their listings
Categories - Browse items by category (Books, Electronics, Furniture, etc.)
Search & Filter - Find exactly what you're looking for
Responsive Design - Works seamlessly on desktop and mobile devices

🚀 Tech Stack

Frontend: React.js with React Router
Styling: Bootstrap 5 + Custom CSS
Backend: Supabase (PostgreSQL database + Authentication)
Hosting: [Your hosting platform]

📋 Prerequisites
Before you begin, ensure you have:

Node.js (v14 or higher)
npm or yarn
A Supabase account

🛠️ Installation

Clone the repository

bash   git clone https://github.com/kritish-ktm/Freestuffnielsbrock.git
   cd Freestuffnielsbrock

Install dependencies

bash   npm install

Set up environment variables
Create a .env file in the root directory:

env   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

Set up Supabase Database
Run these SQL commands in your Supabase SQL Editor:

sql   -- Create user_profiles table
   CREATE TABLE user_profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT,
     full_name TEXT,
     section TEXT,
     course TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create items table
   CREATE TABLE items (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10,2) DEFAULT 0,
     category TEXT,
     condition TEXT,
     location TEXT,
     image TEXT,
     posted_by UUID REFERENCES auth.users,
     posted_by_name TEXT,
     posted_by_email TEXT,
     posted_by_section TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE items ENABLE ROW LEVEL SECURITY;

   -- Policies for user_profiles
   CREATE POLICY "Users can insert own profile" ON user_profiles
     FOR INSERT TO authenticated
     WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON user_profiles
     FOR UPDATE TO authenticated
     USING (auth.uid() = id);

   CREATE POLICY "Anyone can view all profiles" ON user_profiles
     FOR SELECT TO authenticated
     USING (true);

   -- Policies for items
   CREATE POLICY "Anyone can view items" ON items
     FOR SELECT TO authenticated
     USING (true);

   CREATE POLICY "Users can insert own items" ON items
     FOR INSERT TO authenticated
     WITH CHECK (auth.uid() = posted_by);

   CREATE POLICY "Users can update own items" ON items
     FOR UPDATE TO authenticated
     USING (auth.uid() = posted_by);

   CREATE POLICY "Users can delete own items" ON items
     FOR DELETE TO authenticated
     USING (auth.uid() = posted_by);

   -- Auto-create profile on signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.user_profiles (id, email, full_name, section, course)
     VALUES (
       NEW.id,
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
       COALESCE(NEW.raw_user_meta_data->>'section', 'N/A'),
       COALESCE(NEW.raw_user_meta_data->>'course', 'N/A')
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

Start the development server

bash   npm start
The app will open at http://localhost:3000
📁 Project Structure
Freestuffnielsbrock/
├── public/
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React Context (Auth)
│   ├── pages/          # Page components
│   ├── supabase.js     # Supabase configuration
│   ├── App.js          # Main app component
│   └── index.js        # Entry point
├── .env                # Environment variables (not in repo)
├── .gitignore
├── package.json
└── README.md
🔐 Environment Variables
Required environment variables:
VariableDescriptionREACT_APP_SUPABASE_URLYour Supabase project URLREACT_APP_SUPABASE_ANON_KEYYour Supabase anonymous key
🤝 Contributing

Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

📝 License
This project is open source and available under the MIT License.
👥 Authors

Kritish - GitHub

🙏 Acknowledgments

Niels Brock Copenhagen Business College
Supabase for backend infrastructure
Bootstrap for UI components

📞 Support
If you have any questions or run into issues, please open an issue on GitHub.

Made with ❤️ for Niels Brock students
