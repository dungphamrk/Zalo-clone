import { Contact } from "@/types/interfaces";

// Danh sách ảnh avatar đa dạng và không trùng nhau
const AVATAR_IMAGES = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
  'https://i.pravatar.cc/150?img=7',
  'https://i.pravatar.cc/150?img=8',
  'https://i.pravatar.cc/150?img=9',
  'https://i.pravatar.cc/150?img=10',
  'https://i.pravatar.cc/150?img=11',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=13',
  'https://i.pravatar.cc/150?img=14',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=16',
  'https://i.pravatar.cc/150?img=17',
  'https://i.pravatar.cc/150?img=18',
  'https://i.pravatar.cc/150?img=19',
  'https://i.pravatar.cc/150?img=20',
  'https://i.pravatar.cc/150?img=21',
  'https://i.pravatar.cc/150?img=22',
  'https://i.pravatar.cc/150?img=23',
  'https://i.pravatar.cc/150?img=24',
  'https://i.pravatar.cc/150?img=25',
  'https://i.pravatar.cc/150?img=26',
  'https://i.pravatar.cc/150?img=27',
  'https://i.pravatar.cc/150?img=28',
  'https://i.pravatar.cc/150?img=29',
  'https://i.pravatar.cc/150?img=30',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/76.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
  'https://randomuser.me/api/portraits/women/25.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/men/67.jpg',
  'https://randomuser.me/api/portraits/women/56.jpg',
  'https://randomuser.me/api/portraits/men/88.jpg',
  'https://randomuser.me/api/portraits/women/77.jpg',
  'https://randomuser.me/api/portraits/men/91.jpg',
  'https://randomuser.me/api/portraits/women/82.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
  'https://randomuser.me/api/portraits/women/28.jpg',
  'https://randomuser.me/api/portraits/men/39.jpg',
  'https://randomuser.me/api/portraits/women/47.jpg',
  'https://randomuser.me/api/portraits/men/58.jpg',
  'https://randomuser.me/api/portraits/women/69.jpg',
];

export const ALL_CONTACTS: Contact[] = [
  // Friends
  { id: 'f1', name: 'Nguyễn Văn A', username: 'nguyenvana', phone: '0912345678', avatar: AVATAR_IMAGES[0], isFriend: true },
  { id: 'f2', name: 'Trần Thị B', username: 'tranthib', phone: '0987654321', avatar: AVATAR_IMAGES[1], isFriend: true },
  { id: 'f3', name: 'Lê Hoàng C', username: 'lehoangc', phone: '0905123456', avatar: AVATAR_IMAGES[2], isFriend: true },
  { id: 'f4', name: 'Phạm Thùy D', username: 'phamthuyd', phone: '0933987654', avatar: AVATAR_IMAGES[3], isFriend: true },
  { id: 'f5', name: 'Hoàng Minh E', username: 'hoangminhe', phone: '0922123456', avatar: AVATAR_IMAGES[4], isFriend: true },
  // Strangers
  { id: 's6', name: 'Khách hàng 6', username: 'stranger6', phone: '0911223344', avatar: AVATAR_IMAGES[5], isFriend: false },
  { id: 's7', name: 'Đối tác 7', username: 'stranger7', phone: '0944556677', avatar: AVATAR_IMAGES[6], isFriend: false },
  { id: 's8', name: 'Người dùng 8', username: 'stranger8', phone: '0977889900', avatar: AVATAR_IMAGES[7], isFriend: false },
];
// Phân loại và Sắp xếp bạn bè theo tên (A-Z)
export const FRIENDS = ALL_CONTACTS.filter(c => c.isFriend).sort((a, b) => a.name.localeCompare(b.name));
export const STRANGERS = ALL_CONTACTS.filter(c => !c.isFriend);

// Dữ liệu giả cho Lời mời
export const INCOMING_REQUESTS: Contact[] = [
  { id: 'inc1', name: 'Nguyễn Đình K', username: 'knguyen', phone: '0919191919', avatar: AVATAR_IMAGES[8], isFriend: false },
  { id: 'inc2', name: 'Lý Thu M', username: 'mly', phone: '0977665544', avatar: AVATAR_IMAGES[9], isFriend: false },
];

export const OUTGOING_REQUESTS: Contact[] = [
  { id: 's6', name: 'Khách hàng 6', username: 'stranger6', phone: '0911223344', avatar: AVATAR_IMAGES[10], isFriend: false },
  { id: 's7', name: 'Đối tác 7', username: 'stranger7', phone: '0944556677', avatar: AVATAR_IMAGES[11], isFriend: false },
];