export const COLORS = { primary: '#5B2DF0', dark: '#1A1A2E', grey: '#8A8A9E', light: '#F4F3FB', green: '#16A34A', orange: '#F59E0B', red: '#DC2626' };

export const IMG = {
  banner: require('../assets/vendors/banner.jpg'),
  avatar: require('../assets/vendors/avatar2.jpg'),
  heroDJ: require('../assets/vendors/djhero.jpg'),
};

export const CATEGORIES = [
  { id: 'dj', name: 'DJ Booking', icon: 'headset', lib: 'ion', color: '#EDE9FE' },
  { id: 'tent', name: 'Tent House', icon: 'tent', lib: 'mci', color: '#FEF3C7' },
  { id: 'cars', name: 'Luxury Cars', icon: 'car-sport', lib: 'ion', color: '#DBEAFE' },
];

export const VENDORS = [
  { id: '1', name: 'Royal DJ Sound', rating: 4.8, reviews: 120, location: 'Koderma, Jharkhand', price: 15000, category: 'dj', color: '#2D1B69', tag: 'Popular', img: require('../assets/vendors/dj1.jpg'), hero: require('../assets/vendors/djhero.jpg') },
  { id: '2', name: 'Power Bass DJ', rating: 4.6, reviews: 86, location: 'Koderma, Jharkhand', price: 10000, category: 'dj', color: '#0EA5E9', tag: 'Popular', img: require('../assets/vendors/dj2.jpg') },
  { id: '3', name: 'Shiv DJ Center', rating: 4.7, reviews: 60, location: 'Satgawan, Koderma', price: 12000, category: 'dj', color: '#065F46', tag: null, img: require('../assets/vendors/dj3.jpg') },
  { id: '4', name: 'High Voltage DJ', rating: 4.5, reviews: 45, location: 'Rajgarhi, Koderma', price: 18000, category: 'dj', color: '#7C2D12', tag: null, img: require('../assets/vendors/dj4.jpg') },
  { id: '5', name: 'Shiv Shakti Tent House', rating: 4.7, reviews: 98, location: 'Satgawan, Koderma', price: 20000, category: 'tent', color: '#B45309', tag: 'Popular', img: require('../assets/vendors/tent.jpg') },
  { id: '6', name: 'BMW 7 Series', rating: 4.9, reviews: 40, location: 'Koderma, Jharkhand', price: 25000, category: 'cars', color: '#111827', tag: null, img: require('../assets/vendors/bmw.jpg') },
];

export const BOOKINGS = [
  { id: 'BK1025', vendor: 'Royal DJ Sound', date: '15 Aug 2026', time: '07:00 PM', status: 'Confirmed', color: '#2D1B69', img: require('../assets/vendors/dj1.jpg') },
  { id: 'BK1024', vendor: 'Shiv Shakti Tent House', date: '20 Aug 2026', time: '11:00 AM', status: 'Pending', color: '#B45309', img: require('../assets/vendors/tent.jpg') },
  { id: 'BK1023', vendor: 'BMW 7 Series', date: '25 Aug 2026', time: '09:00 AM', status: 'Cancelled', color: '#111827', img: require('../assets/vendors/bmw.jpg') },
];

export const fmt = (n) => '₹' + n.toLocaleString('en-IN');
