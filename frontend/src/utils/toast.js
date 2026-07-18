import toast from 'react-hot-toast';

const base = {
  duration: 4200,
  style: {
    borderRadius: '10px',
    background: '#1a3d42',
    color: '#fff',
    fontSize: '0.875rem',
    padding: '10px 14px'
  }
};

export const notify = {
  success: (message) => toast.success(message, base),
  error: (message) =>
    toast.error(message, {
      ...base,
      style: { ...base.style, background: '#9f2d2d' }
    }),
  info: (message) => toast(message, base)
};

export default notify;
