import { Contact } from "@/types/interfaces";

export const ALL_CONTACTS: Contact[] = [
  // Friends
  { id: 'f1', name: 'Nguyễn Văn A', username: 'nguyenvana', phone: '0912345678', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', isFriend: true },
  { id: 'f2', name: 'Trần Thị B', username: 'tranthib', phone: '0987654321', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', isFriend: true },
  { id: 'f3', name: 'Lê Hoàng C', username: 'lehoangc', phone: '0905123456', avatar: 'https://randomuser.me/api/portraits/men/76.jpg', isFriend: true },
  { id: 'f4', name: 'Phạm Thùy D', username: 'phamthuyd', phone: '0933987654', avatar: 'https://randomuser.me/api/portraits/women/12.jpg', isFriend: true },
  { id: 'f5', name: 'Hoàng Minh E', username: 'hoangminhe', phone: '0922123456', avatar: 'https://randomuser.me/api/portraits/men/18.jpg', isFriend: true },
  // Strangers
  { id: 's6', name: 'Khách hàng 6', username: 'stranger6', phone: '0911223344', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', isFriend: false },
  { id: 's7', name: 'Đối tác 7', username: 'stranger7', phone: '0944556677', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', isFriend: false },
  { id: 's8', name: 'Người dùng 8', username: 'stranger8', phone: '0977889900', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', isFriend: false },
];
// Phân loại và Sắp xếp bạn bè theo tên (A-Z)
export const FRIENDS = ALL_CONTACTS.filter(c => c.isFriend).sort((a, b) => a.name.localeCompare(b.name));
export const STRANGERS = ALL_CONTACTS.filter(c => !c.isFriend);

// Dữ liệu giả cho Lời mời
export const INCOMING_REQUESTS: Contact[] = [
  { id: 'inc1', name: 'Nguyễn Đình K', username: 'knguyen', phone: '0919191919', avatar: 'https://randomuser.me/api/portraits/men/99.jpg', isFriend: false },
  { id: 'inc2', name: 'Lý Thu M', username: 'mly', phone: '0977665544', avatar: 'https://randomuser.me/api/portraits/women/98.jpg', isFriend: false },
];

export const OUTGOING_REQUESTS: Contact[] = [
  { id: 's6', name: 'Khách hàng 6', username: 'stranger6', phone: '0911223344', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', isFriend: false },
  { id: 's7', name: 'Đối tác 7', username: 'stranger7', phone: '0944556677', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', isFriend: false },
];