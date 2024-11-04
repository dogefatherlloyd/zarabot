/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'gwsmfmqtmuhmglnfzqma.supabase.co',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com'
    ]
  }
};

module.exports = nextConfig;
