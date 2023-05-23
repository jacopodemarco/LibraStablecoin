module.exports = {
  distDir:'build',
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spooky.fi'],
    loader: 'akamai',
    path: '',
  },
  eslint:{
    ignoreDuringBuilds:true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/redemption',
        permanent: true,
      },
    ]
  },
}
