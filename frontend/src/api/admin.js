import api from './axios';

export const getStats = () => api.get('/admin/stats').then((r) => r.data);
export const getAdminProducts = (p = 1) =>
  api.get('/admin/products', { params: { page: p } }).then((r) => r.data);
export const getAdminCategories = () =>
  api.get('/admin/categories').then((r) => r.data);
export const createProduct = (data) =>
  api.post('/admin/products', data).then((r) => r.data);
export const updateProduct = (id, d) =>
  api.put(`/admin/products/${id}`, d).then((r) => r.data);
export const deleteProduct = (id) =>
  api.delete(`/admin/products/${id}`).then((r) => r.data);
export const getAdminOrders = (p = 1, status = '') =>
  api
    .get('/admin/orders', { params: { page: p, status: status || undefined } })
    .then((r) => r.data);
export const updateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}`, { status }).then((r) => r.data);
export const getAdminUsers = (p = 1, search = '') =>
  api
    .get('/admin/users', { params: { page: p, search: search || undefined } })
    .then((r) => r.data);
export const toggleAdmin = (id) =>
  api.post(`/admin/users/${id}/toggle-admin`).then((r) => r.data);

// ─── Galería ─────────────────────────────────────────────────────────
export const getAdminGallery = () =>
  api.get('/admin/gallery').then((r) => r.data.data);
export const createGalleryByUrl = (data) =>
  api.post('/admin/gallery', data).then((r) => r.data);
export const uploadGalleryImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return api
    .post('/admin/gallery/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
export const updateGalleryPhoto = (id, d) =>
  api.put(`/admin/gallery/${id}`, d).then((r) => r.data);
export const deleteGalleryPhoto = (id) =>
  api.delete(`/admin/gallery/${id}`).then((r) => r.data);

// ─── Staff ───────────────────────────────────────────────────────────
export const getAdminStaff = () =>
  api.get('/admin/staff').then((r) => r.data.data);
export const createStaff = (data) =>
  api.post('/admin/staff', data).then((r) => r.data);
export const updateStaff = (id, d) =>
  api.put(`/admin/staff/${id}`, d).then((r) => r.data);
export const deleteStaff = (id) =>
  api.delete(`/admin/staff/${id}`).then((r) => r.data);

// ─── Testimonios ─────────────────────────────────────────────────────
export const getAdminTestimonials = () =>
  api.get('/admin/testimonials').then((r) => r.data.data);
export const setTestimonialApproved = (id, approved) =>
  api.put(`/admin/testimonials/${id}`, { is_approved: approved }).then((r) => r.data);

// ─── Cupones ─────────────────────────────────────────────────────────
export const getAdminCoupons = () =>
  api.get('/admin/coupons').then((r) => r.data.data);
export const createCoupon = (data) =>
  api.post('/admin/coupons', data).then((r) => r.data);
export const updateCoupon = (id, d) =>
  api.put(`/admin/coupons/${id}`, d).then((r) => r.data);
export const deleteCoupon = (id) =>
  api.delete(`/admin/coupons/${id}`).then((r) => r.data);

// ─── Analytics ───────────────────────────────────────────────────────
export const getAnalytics = () =>
  api.get('/admin/analytics').then((r) => r.data.data);

// ─── Códigos de canje ────────────────────────────────────────────────
export const getAdminCodes = (status = '', category = '') =>
  api
    .get('/admin/codes', {
      params: { status: status || undefined, category: category || undefined },
    })
    .then((r) => r.data.data);
export const createCodes = (category, quantity) =>
  api.post('/admin/codes', { category, quantity }).then((r) => r.data.data);

// Descarga el CSV de órdenes (con el token de auth vía axios).
export const exportOrders = () =>
  api.get('/admin/orders/export', { responseType: 'blob' }).then((r) => {
    const url = URL.createObjectURL(new Blob([r.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordenes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
