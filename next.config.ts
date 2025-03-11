/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Si realmente necesitas usar estas opciones experimentales, verifica si están disponibles en la versión que estás utilizando.
    //serverActions: true, 
    //serverComponentsExternalPackages: ["mongoose"], 
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
    domains: ["utfs.io", "d1frb0m7uh.ufs.sh"], // Agrega todos los dominios que uses
 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
