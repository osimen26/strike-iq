export const theme = {
  colors: {
    brand: {
      mint: 'var(--primary-100)',
      emerald: '#108960',
      actionGreen: 'var(--primary-600)',
      actionGreenHover: '#0f694d',
    },
    background: {
      app: '#111111',
      surface: '#191919',
      glass: 'rgba(255, 255, 255, 0.15)',
    },
    border: {
      glass: 'rgba(255, 255, 255, 0.10)',
    },
    accent: {
      dimGray: '#3b3b3b',
      mutedSage: '#697564',
    }
  },
  typography: {
    fonts: {
      heading: '"Tilt Warp", sans-serif',
      main: '"Inter", sans-serif',
      mono: '"Geist Mono", monospace',
    },
    sizes: {
      body: '16px',
      overline: '16px',
      subtitle: 'clamp(24px, 4vw, 34px)',
      sectionTitle: 'clamp(40px, 5vw, 56px)',
      hero: '56px',
    },
    weights: {
      medium: 500,
      semiBold: 600,
      bold: 700,
    }
  },
  elevation: {
    glass: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.10)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px'
    }
  }
};

export default theme;
